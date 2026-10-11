import { before, after, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Optional tooling lives outside application dependencies; see CRM-SEGURIDAD.md.
const requireTooling = createRequire(new URL('../work/crm-emulator/package.json', import.meta.url));
const { initializeTestEnvironment, assertSucceeds, assertFails } = requireTooling('@firebase/rules-unit-testing');
const { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } = requireTooling('firebase/firestore');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
let environment;
let owner;
let stranger;
let visitor;
const clientPath = 'advisors/advisor-a/crmClients/first';
const data = (overrides = {}) => ({
  name: 'Cliente de prueba', email: 'cliente@example.com', phone: '', city: 'Pereira',
  interest: 'Solar', source: 'Sitio web', stage: 'nuevo', value: 1000000,
  nextFollowUp: '', nextAction: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  ...overrides,
});

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-redsolar-crm',
    firestore: {
      host: '127.0.0.1', port: 8088,
      rules,
    },
  });
  owner = environment.authenticatedContext('advisor-a').firestore();
  stranger = environment.authenticatedContext('advisor-b').firestore();
  visitor = environment.unauthenticatedContext().firestore();
});

after(async () => { await environment?.cleanup(); });

test('Owner can atomically create a client and initial activity, then read their collection', async () => {
  const batch = writeBatch(owner);
  batch.set(doc(owner, clientPath), data());
  batch.set(doc(owner, `${clientPath}/activities/initial`), { type: 'stage', text: 'Cliente registrado.', createdAt: serverTimestamp() });
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(owner, clientPath)));
  await assertSucceeds(getDocs(collection(owner, 'advisors/advisor-a/crmClients')));
  await assertSucceeds(getDocs(collection(owner, `${clientPath}/activities`)));
});

test('A different signed-in advisor cannot read, query or write the owner’s clients or history', async () => {
  await assertFails(getDoc(doc(stranger, clientPath)));
  await assertFails(getDocs(collection(stranger, 'advisors/advisor-a/crmClients')));
  await assertFails(updateDoc(doc(stranger, clientPath), { stage: 'ganado', updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(stranger, 'advisors/advisor-a/crmClients/injected'), data()));
  await assertFails(getDoc(doc(stranger, `${clientPath}/activities/initial`)));
  await assertFails(setDoc(doc(stranger, `${clientPath}/activities/injected`), { type: 'note', text: 'Ajena', createdAt: serverTimestamp() }));
});

test('Unauthenticated visitors cannot read or write clients or activities', async () => {
  await assertFails(getDoc(doc(visitor, clientPath)));
  await assertFails(setDoc(doc(visitor, 'advisors/advisor-a/crmClients/anonymous'), data()));
  await assertFails(getDoc(doc(visitor, `${clientPath}/activities/initial`)));
  await assertFails(setDoc(doc(visitor, `${clientPath}/activities/anonymous`), { type: 'note', text: 'Anónima', createdAt: serverTimestamp() }));
});

test('Rules reject extra fields, missing contact, negative values, invalid stages and forged timestamps', async () => {
  const invalid = [
    { ownerId: 'advisor-b' }, { email: '', phone: '' }, { value: -1 }, { stage: 'admin' },
    { createdAt: Timestamp.fromMillis(1) }, { updatedAt: Timestamp.fromMillis(1) },
    { nextFollowUp: '2026-10-11', nextAction: '' },
  ];
  for (const [index, fields] of invalid.entries()) {
    await assertFails(setDoc(doc(owner, `advisors/advisor-a/crmClients/invalid-${index}`), data(fields)));
  }
  await assertFails(updateDoc(doc(owner, clientPath), { createdAt: Timestamp.fromMillis(1), updatedAt: serverTimestamp() }));
});

test('Owner can update opportunity and followup with immutable activity history', async () => {
  const batch = writeBatch(owner);
  batch.update(doc(owner, clientPath), { stage: 'propuesta', nextFollowUp: '2026-10-11', nextAction: 'Llamar', updatedAt: serverTimestamp() });
  batch.set(doc(owner, `${clientPath}/activities/proposal`), { type: 'stage', text: 'Propuesta enviada.', createdAt: serverTimestamp() });
  await assertSucceeds(batch.commit());
  const complete = writeBatch(owner);
  complete.update(doc(owner, clientPath), { nextFollowUp: '', nextAction: '', updatedAt: serverTimestamp() });
  complete.set(doc(owner, `${clientPath}/activities/completed`), { type: 'task_done', text: 'Llamada realizada.', createdAt: serverTimestamp() });
  await assertSucceeds(complete.commit());
  await assertFails(updateDoc(doc(owner, `${clientPath}/activities/initial`), { text: 'Historia modificada' }));
  await assertFails(deleteDoc(doc(owner, `${clientPath}/activities/initial`)));
  await assertFails(deleteDoc(doc(owner, clientPath)));
});

test('Activities require a parent client and valid fields', async () => {
  await assertFails(setDoc(doc(owner, 'advisors/advisor-a/crmClients/missing/activities/orphan'), { type: 'note', text: 'Sin cliente', createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(owner, `${clientPath}/activities/empty`), { type: 'note', text: '', createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(owner, `${clientPath}/activities/extra`), { type: 'note', text: 'Nota', ownerId: 'advisor-a', createdAt: serverTimestamp() }));
});

test('Existing private quotation policies remain usable by their owner', async () => {
  const path = 'cotizaciones/existing-policy';
  await assertSucceeds(setDoc(doc(owner, path), { userId: 'advisor-a', nombre: 'Prueba' }));
  await assertSucceeds(getDoc(doc(owner, path)));
  await assertFails(getDoc(doc(stranger, path)));
  await assertFails(getDoc(doc(visitor, path)));
  await assertSucceeds(updateDoc(doc(owner, path), { nombre: 'Actualizada' }));
  await assertSucceeds(deleteDoc(doc(owner, path)));
});

test('Existing public quotation policy allows public submissions but authenticated reads only', async () => {
  const path = 'cotizaciones_publicas/existing-policy';
  await assertSucceeds(setDoc(doc(visitor, path), { nombre: 'Solicitud pública' }));
  await assertSucceeds(getDoc(doc(owner, path)));
  await assertFails(getDoc(doc(visitor, path)));
  await assertFails(updateDoc(doc(owner, path), { nombre: 'Cambio' }));
  await assertFails(deleteDoc(doc(owner, path)));
});
