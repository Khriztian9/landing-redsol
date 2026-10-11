export const CRM_STAGES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'propuesta', label: 'Propuesta' },
  { id: 'negociacion', label: 'Negociación' },
  { id: 'ganado', label: 'Ganado' },
  { id: 'perdido', label: 'Perdido' },
];

export const CRM_SOURCES = ['Sitio web', 'Referido', 'WhatsApp', 'Llamada', 'Redes sociales', 'Otro'];
export const CRM_ACTIVITY_TYPES = ['note', 'call', 'meeting', 'email', 'task_done', 'stage'];

export function crmValidationError(message) {
  return Object.assign(new Error(message), { code: 'crm/validation' });
}

const TEXT_LIMITS = {
  name: 120, email: 254, phone: 40, city: 100, interest: 240,
  source: 80, stage: 20, nextFollowUp: 10, nextAction: 400,
  quoteId: 200, quoteLabel: 200,
};

export function emptyClient() {
  return {
    name: '', email: '', phone: '', city: '', interest: '',
    source: 'Sitio web', stage: 'nuevo', value: 0,
    nextFollowUp: '', nextAction: '',
  };
}

export function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Keep only editable fields. Ownership and server timestamps never come from a form.
// Length violations are rejected rather than silently losing customer information.
export function sanitizeClient(fields = {}, { partial = false } = {}) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    throw crmValidationError('Los datos del cliente no son válidos.');
  }
  const result = partial ? {} : emptyClient();
  for (const [key, maxLength] of Object.entries(TEXT_LIMITS)) {
    if (!Object.hasOwn(fields, key)) continue;
    if (typeof fields[key] !== 'string') throw crmValidationError(`El campo ${key} debe ser texto.`);
    const value = fields[key].trim();
    if (value.length > maxLength) throw crmValidationError(`El campo ${key} supera ${maxLength} caracteres.`);
    result[key] = value;
  }
  if (Object.hasOwn(fields, 'value')) {
    if (typeof fields.value !== 'number' && typeof fields.value !== 'string') {
      throw crmValidationError('El valor de la oportunidad debe ser un número.');
    }
    result.value = typeof fields.value === 'string' && fields.value.trim() === '' ? 0 : Number(fields.value);
  }
  return result;
}

export function validateClient(fields) {
  let client;
  try {
    client = sanitizeClient(fields);
  } catch (error) {
    return error.message;
  }
  if (client.name.length < 2) return 'Escribe el nombre del cliente (mínimo 2 caracteres).';
  if (!client.email && !client.phone) return 'Registra al menos un teléfono o correo del cliente.';
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) return 'Escribe un correo electrónico válido.';
  if (client.phone && (!/^\+?[\d\s().-]{7,40}$/.test(client.phone)
    || client.phone.replace(/\D/g, '').length < 7 || client.phone.replace(/\D/g, '').length > 20)) {
    return 'Revisa el número de teléfono.';
  }
  if (!CRM_STAGES.some(({ id }) => id === client.stage)) return 'Selecciona una etapa válida.';
  if (!CRM_SOURCES.includes(client.source)) return 'Selecciona un origen válido.';
  if (!Number.isFinite(client.value) || client.value < 0 || client.value > 1_000_000_000_000) {
    return 'El valor debe estar entre 0 y 1 billón de pesos.';
  }
  if (client.nextFollowUp && !isDateOnly(client.nextFollowUp)) return 'Selecciona una fecha de seguimiento válida.';
  if (client.nextFollowUp && !client.nextAction) return 'Indica qué harás en el próximo seguimiento.';
  if (client.nextAction && !client.nextFollowUp) return 'Selecciona la fecha del próximo seguimiento.';
  if (client.quoteId && client.quoteId.includes('/')) return 'La referencia de cotización no es válida.';
  return '';
}

export function sanitizeActivity(fields = {}) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw crmValidationError('Los datos de la actividad no son válidos.');
  const { type = 'note', text = '' } = fields;
  if (!CRM_ACTIVITY_TYPES.includes(type)) throw crmValidationError('Selecciona un tipo de actividad válido.');
  if (typeof text !== 'string' || !text.trim()) throw crmValidationError('Escribe el detalle de la actividad.');
  if (text.trim().length > 4000) throw crmValidationError('La actividad admite hasta 4000 caracteres.');
  return { type, text: text.trim() };
}

export function assertFollowUpCurrent(client, { expectedNextFollowUp, expectedNextAction } = {}) {
  if (!client.nextFollowUp) throw crmValidationError('Este seguimiento ya se completó o no está programado.');
  if ((expectedNextFollowUp !== undefined && client.nextFollowUp !== expectedNextFollowUp)
    || (expectedNextAction !== undefined && client.nextAction !== expectedNextAction)) {
    throw crmValidationError('El seguimiento cambió en otra sesión. Revisa la fecha y la acción actuales antes de completarlo.');
  }
}

export function todayInBogota(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isActiveClient(client) {
  return client.stage !== 'ganado' && client.stage !== 'perdido';
}

function normalized(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

export function filterClients(clients, { search = '', stage = 'all', followUp = 'all' } = {}, today = todayInBogota()) {
  const needle = normalized(search);
  return clients.filter((client) => {
    if (stage && stage !== 'all' && client.stage !== stage) return false;
    if (needle && ![client.name, client.email, client.phone, client.city, client.interest, client.quoteLabel]
      .some((value) => normalized(value).includes(needle))) return false;
    const date = client.nextFollowUp;
    if (followUp && followUp !== 'all') {
      if (!isActiveClient(client)) return false;
      if (followUp === 'today' && date !== today) return false;
      if (followUp === 'overdue' && !(date && date < today)) return false;
      if (followUp === 'upcoming' && !(date && date > today)) return false;
      if (followUp === 'unscheduled' && date) return false;
      if (followUp === 'pending' && !date) return false;
    }
    return true;
  });
}

export function getCrmMetrics(clients, today = todayInBogota()) {
  return clients.reduce((totals, client) => {
    if (client.stage === 'ganado') totals.won += 1;
    if (isActiveClient(client)) {
      totals.active += 1;
      const value = Number(client.value);
      if (Number.isFinite(value) && value > 0) totals.pipelineValue += value;
      if (client.nextFollowUp === today) totals.dueToday += 1;
      if (client.nextFollowUp && client.nextFollowUp < today) totals.overdue += 1;
    }
    return totals;
  }, { active: 0, pipelineValue: 0, dueToday: 0, overdue: 0, won: 0 });
}

export function formatDate(value) {
  if (!value) return 'Sin fecha';
  const dateOnly = typeof value === 'string' && isDateOnly(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !dateOnly) return 'Sin fecha';
  const date = dateOnly ? new Date(`${value}T12:00:00Z`) : value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: dateOnly ? 'UTC' : 'America/Bogota',
  }).format(date);
}
