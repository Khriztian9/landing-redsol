import {
  collection, doc, onSnapshot, orderBy, query, runTransaction,
  serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firestore';
import { CRM_STAGES, assertFollowUpCurrent, crmValidationError, sanitizeActivity, sanitizeClient, validateClient } from '../utils/crm';

function clientCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw crmValidationError('Inicia sesión para acceder a tu CRM.');
  return collection(db, 'advisors', uid, 'crmClients');
}

function clientDocument(clientId) {
  if (typeof clientId !== 'string' || !clientId || clientId.includes('/')) throw crmValidationError('Cliente no válido.');
  return doc(clientCollection(), clientId);
}

function assertValidClient(client) {
  const message = validateClient(client);
  if (message) throw crmValidationError(message);
}

function stageLabel(stage) {
  return CRM_STAGES.find(({ id }) => id === stage)?.label || stage;
}

export function subscribeClients(onData, onError) {
  return onSnapshot(query(clientCollection(), orderBy('updatedAt', 'desc')), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
  }, onError);
}

export async function createClient(fields) {
  const client = sanitizeClient(fields);
  assertValidClient(client);
  const reference = doc(clientCollection());
  const batch = writeBatch(db);
  batch.set(reference, { ...client, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  batch.set(doc(collection(reference, 'activities')), {
    type: 'stage', text: `Cliente registrado en ${stageLabel(client.stage)}.`, createdAt: serverTimestamp(),
  });
  await batch.commit();
  return reference.id;
}

export async function updateClient(clientId, fields) {
  const reference = clientDocument(clientId);
  const updates = sanitizeClient(fields, { partial: true });
  if (!Object.keys(updates).length) return;
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw crmValidationError('El cliente ya no está disponible.');
    const current = snapshot.data();
    assertValidClient({ ...current, ...updates });
    transaction.update(reference, { ...updates, updatedAt: serverTimestamp() });
    if (updates.stage && current.stage !== updates.stage) {
      transaction.set(doc(collection(reference, 'activities')), {
        type: 'stage',
        text: `Etapa actualizada: ${stageLabel(current.stage)} → ${stageLabel(updates.stage)}.`,
        createdAt: serverTimestamp(),
      });
    }
  });
}

export function subscribeActivities(clientId, onData, onError) {
  return onSnapshot(query(collection(clientDocument(clientId), 'activities'), orderBy('createdAt', 'desc')), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
  }, onError);
}

export async function addActivity(clientId, fields) {
  const activity = sanitizeActivity(fields);
  const reference = clientDocument(clientId);
  const batch = writeBatch(db);
  batch.set(doc(collection(reference, 'activities')), { ...activity, createdAt: serverTimestamp() });
  batch.update(reference, { updatedAt: serverTimestamp() });
  await batch.commit();
}

export async function completeFollowUp(clientId, { text = '', expectedNextFollowUp, expectedNextAction } = {}) {
  if (typeof text !== 'string') throw crmValidationError('El detalle del seguimiento debe ser texto.');
  const reference = clientDocument(clientId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw crmValidationError('El cliente ya no está disponible.');
    const client = snapshot.data();
    assertFollowUpCurrent(client, { expectedNextFollowUp, expectedNextAction });
    const activity = sanitizeActivity({
      type: 'task_done',
      text: `Seguimiento completado (${client.nextFollowUp}): ${client.nextAction || 'Seguimiento'}${text.trim() ? `\n${text.trim()}` : ''}`,
    });
    transaction.update(reference, { nextFollowUp: '', nextAction: '', updatedAt: serverTimestamp() });
    transaction.set(doc(collection(reference, 'activities')), { ...activity, createdAt: serverTimestamp() });
  });
}
