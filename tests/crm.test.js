import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFollowUpCurrent, emptyClient, filterClients, formatDate, getCrmMetrics, isDateOnly,
  sanitizeActivity, sanitizeClient, todayInBogota, validateClient,
} from '../src/utils/crm.js';

const client = (fields = {}) => ({ ...emptyClient(), name: 'María López', email: 'contacto@example.com', ...fields });
const today = '2026-10-11';

test('Only editable fields survive sanitation; identity and timestamps cannot be supplied by forms', () => {
  const clean = sanitizeClient({
    name: '  María López  ', value: '35000000',
    id: 'other-document', uid: 'other-user', ownerId: 'other-user',
    createdAt: 'forged', updatedAt: 'forged', customField: 'ignored',
  });
  assert.equal(clean.name, 'María López');
  assert.equal(clean.value, 35000000);
  assert.equal(clean.stage, 'nuevo');
  for (const protectedField of ['id', 'uid', 'ownerId', 'createdAt', 'updatedAt', 'customField']) {
    assert.equal(Object.hasOwn(clean, protectedField), false);
  }
  assert.deepEqual(sanitizeClient({ stage: 'propuesta', ownerId: 'x' }, { partial: true }), { stage: 'propuesta' });
});

test('An update does not reset unspecified client fields to defaults', () => {
  const existing = client({ value: 9000000, phone: '+57 318 555 0123', stage: 'propuesta' });
  const updates = sanitizeClient({ nextFollowUp: '2026-10-12', nextAction: 'Visitar el inmueble' }, { partial: true });
  const result = { ...existing, ...updates };
  assert.equal(validateClient(result), '');
  assert.equal(result.value, 9000000);
  assert.equal(result.stage, 'propuesta');
  assert.equal(result.phone, existing.phone);
});

test('Input rejects malformed contact data, stages, money, field types, and excessive text', () => {
  const invalid = [
    { name: '' }, { email: 'cliente@' }, { phone: 'hola' }, { phone: '.......' }, { stage: 'admin' },
    { source: 'untrusted' }, { value: -1 }, { value: 'no es un monto' },
    { value: Infinity }, { value: 1_000_000_000_001 }, { value: [] },
    { name: { text: 'María' } }, { name: 'x'.repeat(121) }, { quoteId: 'foreign/path' },
  ];
  for (const fields of invalid) assert.notEqual(validateClient(client(fields)), '', JSON.stringify(fields));
  assert.equal(validateClient(client({ phone: '+57 (318) 555-0123', email: 'maria@example.com', value: 0 })), '');
});

test('Every client requires at least one contact method, rejecting whitespace-only contact fields', () => {
  assert.match(validateClient(client({ email: '', phone: '' })), /teléfono o correo/);
  assert.match(validateClient(client({ email: '  ', phone: '  ' })), /teléfono o correo/);
  assert.equal(validateClient(client({ phone: '', email: 'maria@example.com' })), '');
  assert.equal(validateClient(client({ email: '', phone: '+57 318 555 0123' })), '');
});

test('Expected validation failures carry the CRM error code for safe user-facing messages', () => {
  for (const attempt of [
    () => sanitizeClient(null), () => sanitizeClient({ name: 8 }),
    () => sanitizeActivity(null), () => sanitizeActivity({ text: '' }),
  ]) assert.throws(attempt, { code: 'crm/validation' });
});

test('Completing a stale or already completed followup is rejected before any write', () => {
  const expected = { expectedNextFollowUp: today, expectedNextAction: 'Llamar' };
  assert.doesNotThrow(() => assertFollowUpCurrent(client({ nextFollowUp: today, nextAction: 'Llamar' }), expected));
  assert.throws(() => assertFollowUpCurrent(client({ nextFollowUp: '2026-10-12', nextAction: 'Llamar' }), expected), { code: 'crm/validation' });
  assert.throws(() => assertFollowUpCurrent(client({ nextFollowUp: today, nextAction: 'Enviar oferta' }), expected), { code: 'crm/validation' });
  assert.throws(() => assertFollowUpCurrent(client(), expected), /ya se completó/);
});

test('Followup dates use real calendar days and require an action and date together', () => {
  assert.equal(isDateOnly('2028-02-29'), true);
  for (const date of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-01', '11/10/2026']) {
    assert.equal(isDateOnly(date), false);
    assert.notEqual(validateClient(client({ nextFollowUp: date, nextAction: 'Llamar' })), '');
  }
  assert.notEqual(validateClient(client({ nextFollowUp: today })), '');
  assert.notEqual(validateClient(client({ nextAction: 'Llamar' })), '');
  assert.equal(validateClient(client({ nextFollowUp: today, nextAction: 'Llamar' })), '');
  assert.equal(validateClient(client()), '');
});

test('Bogotá day boundaries remain correct regardless of the browser or server timezone', () => {
  assert.equal(todayInBogota(new Date('2026-10-12T04:59:59Z')), '2026-10-11');
  assert.equal(todayInBogota(new Date('2026-10-12T05:00:00Z')), '2026-10-12');
  assert.equal(todayInBogota(new Date('2027-01-01T03:00:00Z')), '2026-12-31');
  assert.match(formatDate('2026-10-11'), /11/);
  assert.equal(formatDate(''), 'Sin fecha');
  assert.equal(formatDate('2026-02-30'), 'Sin fecha');
});

const sample = [
  client({ id: 'overdue', city: 'Medellín', stage: 'contactado', value: 10_000_000, nextFollowUp: '2026-10-10', nextAction: 'Llamar' }),
  client({ id: 'today', name: 'Carlos', stage: 'propuesta', value: 20_000_000, nextFollowUp: today, nextAction: 'Enviar oferta' }),
  client({ id: 'future', name: 'Sofía', stage: 'negociacion', value: 30_000_000, nextFollowUp: '2026-10-12', nextAction: 'Visitar' }),
  client({ id: 'no-date', name: 'Pedro', stage: 'nuevo', value: 5_000_000 }),
  client({ id: 'won', name: 'Juliana', stage: 'ganado', value: 90_000_000, nextFollowUp: today }),
  client({ id: 'lost', name: 'Raúl', stage: 'perdido', value: 100_000_000, nextFollowUp: '2026-10-01' }),
];

test('Pipeline metrics exclude won and lost deals from active value and reminders', () => {
  assert.deepEqual(getCrmMetrics(sample, today), {
    active: 4, pipelineValue: 65_000_000, dueToday: 1, overdue: 1, won: 1,
  });
  assert.deepEqual(getCrmMetrics([], today), { active: 0, pipelineValue: 0, dueToday: 0, overdue: 0, won: 0 });
});

test('Search matches accents and case, and combines with stage and followup filters', () => {
  assert.deepEqual(filterClients(sample, { search: 'MEDELLIN' }, today).map(({ id }) => id), ['overdue']);
  assert.deepEqual(filterClients(sample, { search: 'maria', stage: 'contactado', followUp: 'overdue' }, today).map(({ id }) => id), ['overdue']);
  assert.deepEqual(filterClients(sample, { search: 'maria', stage: 'propuesta' }, today), []);
  assert.equal(filterClients(sample).length, sample.length);
});

test('Followup filters separate overdue, today, future and unscheduled, ignoring closed deals', () => {
  const expected = { overdue: ['overdue'], today: ['today'], upcoming: ['future'], unscheduled: ['no-date'], pending: ['overdue', 'today', 'future'] };
  for (const [followUp, ids] of Object.entries(expected)) {
    assert.deepEqual(filterClients(sample, { followUp }, today).map(({ id }) => id), ids);
  }
});

test('Activities accept valid text only and reject unsupported types and oversized notes', () => {
  assert.deepEqual(sanitizeActivity({ type: 'call', text: '  Se programó una visita.  ', ownerId: 'ignored' }), { type: 'call', text: 'Se programó una visita.' });
  assert.throws(() => sanitizeActivity({ type: 'call', text: '   ' }), /detalle/);
  assert.throws(() => sanitizeActivity({ type: 'execute', text: 'nota' }), /tipo/);
  assert.throws(() => sanitizeActivity({ text: 'a'.repeat(4001) }), /4000/);
  assert.throws(() => sanitizeActivity({ text: { html: '<script>' } }), /detalle/);
});
