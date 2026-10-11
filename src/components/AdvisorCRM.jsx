import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firestore';
import { subscribeClients, createClient, updateClient, subscribeActivities, addActivity, completeFollowUp } from '../services/crm';
import { CRM_STAGES, CRM_SOURCES, emptyClient, validateClient, filterClients, getCrmMetrics, todayInBogota, formatDate } from '../utils/crm';
import './crm/CRM.css';

const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);
const stageLabel = (stage) => CRM_STAGES.find((item) => item.id === stage)?.label || stage;
const isClosed = (client) => ['ganado', 'perdido'].includes(client.stage);
const activityLabels = { note: 'Nota', call: 'Llamada', meeting: 'Reunión', email: 'Correo', task_done: 'Seguimiento completado', stage: 'Cambio de etapa' };
const activityIcons = { note: 'journal-text', call: 'telephone', meeting: 'calendar-event', email: 'envelope', task_done: 'check2-circle', stage: 'arrow-right-circle' };
const errorMessage = (error) => error?.code === 'permission-denied'
  ? 'No tienes permiso para acceder a estos datos. Solicita al administrador que revise los permisos del CRM.'
  : error?.code === 'unavailable'
    ? 'No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.'
    : error?.code === 'crm/validation' ? error.message : 'No pudimos completar la operación. Inténtalo de nuevo.';

function Icon({ name }) { return <i className={`bi bi-${name}`} aria-hidden="true" />; }

function Modal({ title, children, onClose, busy = false, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`crm-modal ${wide ? 'crm-modal-wide' : ''}`} aria-labelledby="crm-modal-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="crm-modal-heading"><h2 id="crm-modal-title">{title}</h2><button type="button" className="crm-icon-button" onClick={onClose} disabled={busy} aria-label="Cerrar ventana"><Icon name="x-lg" /></button></div>
    {children}
  </dialog>;
}

function Field({ label, name, form, setForm, type = 'text', required = false, maxLength = 160, ...props }) {
  return <label className="crm-field"><span>{label}{required ? ' *' : ''}</span><input className="form-control" name={name} type={type} value={form[name] ?? ''} required={required} maxLength={maxLength} onChange={(event) => setForm({ ...form, [name]: event.target.value })} {...props} /></label>;
}

function ClientForm({ client, initial, quotes, quotesError, clients, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...emptyClient(), ...(client || initial || {}) }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const duplicate = clients.find((item) => item.id !== client?.id && ((form.email.trim() && item.email?.toLowerCase() === form.email.trim().toLowerCase()) || (form.phone.replace(/\D/g, '').length >= 7 && item.phone?.replace(/\D/g, '') === form.phone.replace(/\D/g, ''))));
  const selectQuote = (id) => {
    const quote = quotes.find((item) => item.id === id);
    setForm((previous) => ({ ...previous, quoteId: id, quoteLabel: quote ? quote.nombre || quote.manual?.nombre || 'Cotización solar' : '', ...(!client && quote ? { name: previous.name || quote.nombre || quote.manual?.nombre || '', city: previous.city || quote.municipio || quote.manual?.municipio || '', value: previous.value || Number(quote.precio_total) || 0 } : {}) }));
  };
  const save = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const validation = validateClient(form);
    if (validation) { setError(validation); return; }
    inFlight.current = true;
    setBusy(true); setError('');
    try {
      const updates = client ? Object.fromEntries(Object.entries(form).filter(([key, value]) => value !== client[key])) : form;
      const id = client ? (await updateClient(client.id, updates), client.id) : await createClient(form);
      onSaved(typeof id === 'string' ? id : id?.id, client ? 'Cliente actualizado.' : 'Cliente registrado.');
    } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); inFlight.current = false; }
  };
  return <Modal title={client ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose} busy={busy} wide>
    <form onSubmit={save}>
      <div className="crm-modal-body">
        <p className="crm-form-intro">Los campos con * son obligatorios. Registra al menos un teléfono o correo.</p>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {duplicate && <div className="alert alert-warning" role="status">Este contacto coincide con {duplicate.name}. Revisa la información para evitar duplicados.</div>}
        <fieldset disabled={busy}>
          <legend>Datos del cliente</legend>
          <div className="crm-form-grid">
            <Field label="Nombre o empresa" name="name" form={form} setForm={setForm} required minLength={2} maxLength={120} autoComplete="name" />
            <Field label="Municipio" name="city" form={form} setForm={setForm} autoComplete="address-level2" maxLength={100} />
            <Field label="Teléfono" name="phone" type="tel" form={form} setForm={setForm} autoComplete="tel" placeholder="+57 300 123 4567" maxLength={40} />
            <Field label="Correo del cliente" name="email" type="email" form={form} setForm={setForm} autoComplete="email" maxLength={254} />
            <label className="crm-field"><span>Origen</span><select className="form-select" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}>{CRM_SOURCES.map((source) => <option key={source}>{source}</option>)}</select></label>
            <Field label="Proyecto de interés" name="interest" form={form} setForm={setForm} placeholder="Ej. Sistema solar para vivienda" maxLength={240} />
          </div>
        </fieldset>
        <fieldset disabled={busy}>
          <legend>Oportunidad comercial</legend>
          <div className="crm-form-grid">
            <label className="crm-field"><span>Etapa</span><select className="form-select" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>{CRM_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
            <Field label="Valor estimado (COP)" name="value" type="number" min="0" max="999999999999" step="1" form={form} setForm={setForm} />
            <label className="crm-field crm-field-full"><span>Cotización vinculada</span><select className="form-select" value={form.quoteId || ''} onChange={(event) => selectQuote(event.target.value)}><option value="">Sin vincular</option>{form.quoteId && !quotes.some((q) => q.id === form.quoteId) && <option value={form.quoteId}>{form.quoteLabel || 'Cotización vinculada'}</option>}{quotes.map((quote) => <option key={quote.id} value={quote.id}>{quote.nombre || quote.manual?.nombre || 'Sin nombre'} · {money(quote.precio_total)} · {quote.id.slice(-6)}</option>)}</select>{quotesError && <small>No fue posible cargar tus cotizaciones. Puedes guardar el cliente sin vincular una.</small>}</label>
          </div>
        </fieldset>
        <fieldset disabled={busy}>
          <legend>Próximo seguimiento</legend>
          <div className="crm-form-grid">
            <Field label="Fecha (Colombia)" name="nextFollowUp" type="date" form={form} setForm={setForm} />
            <Field label="Acción pendiente" name="nextAction" form={form} setForm={setForm} placeholder="Ej. Agendar visita técnica" maxLength={300} />
          </div>
          {isClosed(form) && <p className="crm-muted">Los seguimientos de oportunidades cerradas no aparecen en pendientes.</p>}
        </fieldset>
      </div>
      <div className="crm-modal-footer"><button className="btn btn-outline-dark" type="button" onClick={onClose} disabled={busy}>Cancelar</button><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : client ? 'Guardar cambios' : 'Registrar cliente'}</button></div>
    </form>
  </Modal>;
}

function ClientDetail({ client, onClose, onEdit, onNotice }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState('note');
  const [completion, setCompletion] = useState(false);
  const [retry, setRetry] = useState(0);
  const inFlight = useRef(false);
  useEffect(() => {
    setLoading(true); setHistoryError('');
    return subscribeActivities(client.id, (items) => { setActivities(items); setLoading(false); }, (failure) => { setHistoryError(errorMessage(failure)); setLoading(false); });
  }, [client.id, retry]);
  const perform = async (action, success) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(''); setSuccess('');
    try { await action(); setSuccess(success); onNotice(success); return true; } catch (failure) { setError(errorMessage(failure)); return false; } finally { inFlight.current = false; setBusy(false); }
  };
  const record = async (event) => {
    event.preventDefault();
    const done = await perform(() => completion ? completeFollowUp(client.id, { text: text.trim(), expectedNextFollowUp: completion.nextFollowUp, expectedNextAction: completion.nextAction }) : addActivity(client.id, { type, text: text.trim() }), completion ? 'Seguimiento completado.' : 'Actividad registrada.');
    if (done) { setText(''); setCompletion(false); }
  };
  const phone = client.phone?.replace(/[^\d+]/g, '');
  return <Modal title={client.name} onClose={onClose} busy={busy} wide>
    <div className="crm-modal-body">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}
      <div className="crm-detail-summary"><span className={`crm-stage crm-stage-${client.stage}`}>{stageLabel(client.stage)}</span><strong>{money(client.value)}</strong><button className="btn btn-outline-dark btn-sm" disabled={busy} onClick={onEdit}><Icon name="pencil" /> Editar cliente</button></div>
      <dl className="crm-contact-grid">
        <div><dt>Teléfono</dt><dd>{phone ? <a href={`tel:${phone}`}>{client.phone}</a> : 'Sin teléfono'}</dd></div>
        <div><dt>Correo</dt><dd>{client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : 'Sin correo'}</dd></div>
        <div><dt>Municipio</dt><dd>{client.city || 'Sin registrar'}</dd></div>
        <div><dt>Origen</dt><dd>{client.source}</dd></div>
        <div><dt>Proyecto</dt><dd>{client.interest || 'Sin especificar'}</dd></div>
        <div><dt>Cotización</dt><dd>{client.quoteId ? <Link to={`/dashboard#quote-${encodeURIComponent(client.quoteId)}`}>{client.quoteLabel || 'Ver cotización'} <Icon name="arrow-up-right" /></Link> : 'Sin vincular'}</dd></div>
      </dl>
      <label className="crm-field"><span>Actualizar etapa</span><select className="form-select" value={client.stage} disabled={busy} onChange={(event) => perform(() => updateClient(client.id, { stage: event.target.value }), 'Etapa actualizada.')}>{CRM_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
      <section className="crm-next-step" aria-label="Próximo seguimiento"><div><span className="crm-small-label">PRÓXIMO SEGUIMIENTO</span><strong>{client.nextFollowUp ? formatDate(client.nextFollowUp) : 'Sin programar'}</strong><p>{client.nextAction || 'Define el próximo paso para esta oportunidad.'}</p>{isClosed(client) && <small>Oportunidad cerrada · fuera de pendientes</small>}</div>{client.nextFollowUp ? <button className="btn btn-outline-dark btn-sm" disabled={busy} onClick={() => { setCompletion({ nextFollowUp: client.nextFollowUp, nextAction: client.nextAction }); setText(''); }}><Icon name="check2" /> Completar</button> : <button className="btn btn-outline-dark btn-sm" disabled={busy} onClick={onEdit}>Programar</button>}</section>
      <form onSubmit={record} className="crm-activity-form">
        <h3>{completion ? 'Resultado del seguimiento' : 'Registrar actividad'}</h3>
        <div className="crm-activity-inputs">{!completion && <label className="crm-field"><span>Tipo</span><select className="form-select" value={type} disabled={busy} onChange={(event) => setType(event.target.value)}>{['note', 'call', 'meeting', 'email'].map((value) => <option key={value} value={value}>{activityLabels[value]}</option>)}</select></label>}<label className="crm-field crm-grow"><span>{completion ? '¿Qué se acordó?' : 'Detalle'}</span><textarea className="form-control" value={text} onChange={(event) => setText(event.target.value)} required maxLength={2000} rows="3" disabled={busy} placeholder="Registra los acuerdos y el siguiente paso…" /></label></div>
        <div className="crm-activity-actions">{completion && <button type="button" className="btn btn-outline-dark btn-sm" disabled={busy} onClick={() => setCompletion(false)}>Cancelar</button>}<button type="submit" className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>{busy ? 'Guardando…' : completion ? 'Completar seguimiento' : 'Guardar actividad'}</button></div>
      </form>
      <section className="crm-history"><h3>Historial de actividad</h3>{loading ? <p role="status">Cargando historial…</p> : historyError ? <div role="alert"><p>{historyError}</p><button className="btn btn-outline-dark btn-sm" onClick={() => setRetry(retry + 1)}>Reintentar</button></div> : activities.length === 0 ? <p className="crm-muted">Aún no hay actividades. Registra tu primer contacto.</p> : <ol>{activities.map((activity) => <li key={activity.id}><span className="crm-history-icon"><Icon name={activityIcons[activity.type] || 'journal-text'} /></span><div><div className="crm-history-meta"><strong>{activityLabels[activity.type] || 'Actividad'}</strong><time>{activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' }) : 'Guardando fecha…'}</time></div><p>{activity.text}</p></div></li>)}</ol>}</section>
    </div>
  </Modal>;
}

function FollowUp({ client, today }) {
  if (isClosed(client)) return <span className="crm-muted">Cerrado</span>;
  if (!client.nextFollowUp) return <span className="crm-muted">Sin programar</span>;
  const due = client.nextFollowUp < today ? 'overdue' : client.nextFollowUp === today ? 'today' : '';
  return <span className={`crm-followup ${due}`}><Icon name="calendar3" /> {due === 'today' ? 'Hoy' : formatDate(client.nextFollowUp)}{due === 'overdue' && <small>Vencido</small>}</span>;
}

export default function AdvisorCRM() {
  const { user } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedQuote = searchParams.get('quote');
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [followUp, setFollowUp] = useState('all');
  const [view, setView] = useState('list');
  const [selection, setSelection] = useState(null);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const [today, setToday] = useState(todayInBogota);
  useEffect(() => { const timer = setInterval(() => setToday(todayInBogota()), 30000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    setLoading(true); setError('');
    return subscribeClients((items) => { setClients(items); setLoading(false); }, (failure) => { setClients([]); setError(errorMessage(failure)); setLoading(false); });
  }, [user.uid, retry]);
  useEffect(() => {
    setQuotesLoading(true); setQuotesError('');
    return onSnapshot(query(collection(db, 'cotizaciones'), where('userId', '==', user.uid)), (snapshot) => {
      setQuotes(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0))); setQuotesLoading(false);
    }, () => { setQuotes([]); setQuotesError('No fue posible cargar tus cotizaciones.'); setQuotesLoading(false); });
  }, [user.uid, retry]);
  useEffect(() => {
    if (!requestedQuote || loading || quotesLoading || error) return;
    const existing = clients.find((client) => client.quoteId === requestedQuote);
    const quote = quotes.find((item) => item.id === requestedQuote);
    if (existing) { setSelection(existing.id); setNotice('Esta cotización ya está vinculada a un cliente.'); }
    else if (quote) setEditor({ initial: { ...emptyClient(), name: quote.nombre || quote.manual?.nombre || '', city: quote.municipio || quote.manual?.municipio || '', value: Number(quote.precio_total) || 0, stage: 'propuesta', quoteId: quote.id, quoteLabel: quote.nombre || quote.manual?.nombre || 'Cotización solar', interest: quote.potencia_kwp ? `Sistema solar de ${quote.potencia_kwp} kWp` : 'Sistema solar fotovoltaico' } });
    else setNotice('No se pudo abrir la cotización. Comprueba que pertenece a tu cuenta y vuelve a intentarlo.');
    setSearchParams({}, { replace: true });
  }, [requestedQuote, clients, quotes, loading, quotesLoading, error, setSearchParams]);
  const metrics = useMemo(() => getCrmMetrics(clients, today), [clients, today]);
  const filtered = useMemo(() => filterClients(clients, { search, stage, followUp }, today), [clients, search, stage, followUp, today]);
  const selected = clients.find((client) => client.id === selection);
  const filteredActive = search || stage !== 'all' || followUp !== 'all';
  const reset = () => { setSearch(''); setStage('all'); setFollowUp('all'); };
  const saveFinished = (id, message) => { setEditor(null); setSelection(id); setNotice(message); };
  return <div className="advisor-crm">
    <header className="crm-header"><div><span className="workspace-eyebrow">REDSOLAR / Gestión comercial</span><h1>Tu cartera, en un solo lugar.</h1><p>Conecta con tus clientes y convierte cada seguimiento en una oportunidad.</p></div><button className="btn btn-primary" onClick={() => setEditor({})} disabled={loading || !!error}><Icon name="plus-lg" /> Nuevo cliente</button></header>
    <div className="crm-context"><span><span className="crm-status-dot" /> Mi cartera de clientes</span><span><Icon name="person-circle" /> {user.email}</span></div>
    {notice && <div className="crm-notice" role="status"><Icon name="info-circle" /><span>{notice}</span><button type="button" className="crm-icon-button" onClick={() => setNotice('')} aria-label="Cerrar aviso"><Icon name="x-lg" /></button></div>}
    <section className="crm-metrics" aria-label="Resumen de tu cartera">
      {[{ label: 'Oportunidades activas', value: metrics.active, icon: 'people', detail: 'Clientes en proceso' }, { label: 'Valor en oportunidades', value: money(metrics.pipelineValue), icon: 'graph-up-arrow', detail: 'Valor estimado · COP' }, { label: 'Seguimientos para hoy', value: metrics.dueToday, icon: 'calendar-check', detail: 'Tu siguiente paso', filter: 'today' }, { label: 'Seguimientos vencidos', value: metrics.overdue, icon: 'clock-history', detail: 'Retoma la conversación', filter: 'overdue' }].map((item) => <div className={`crm-metric ${item.filter === 'overdue' && metrics.overdue ? 'crm-metric-alert' : ''}`} key={item.label}><div><span>{item.label}</span><Icon name={item.icon} /></div><strong>{loading || error ? '—' : item.value}</strong>{item.filter ? <button type="button" onClick={() => { setFollowUp(item.filter); setStage('all'); setSearch(''); }} disabled={loading || !!error}>{item.detail} <Icon name="arrow-right" /></button> : <small>{item.detail}</small>}</div>)}
    </section>
    <section className="crm-workspace" aria-labelledby="crm-clients-title">
      <div className="crm-section-heading"><div><h2 id="crm-clients-title">Clientes y oportunidades <span>{loading ? '…' : clients.length}</span></h2><p>Elige un cliente para ver su ficha y registrar avances.</p></div><div className="crm-view-switch" aria-label="Vista de clientes"><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list-ul" /> Lista</button><button type="button" aria-pressed={view === 'board'} onClick={() => setView('board')}><Icon name="kanban" /> Tablero</button></div></div>
      <div className="crm-toolbar"><label className="crm-search"><Icon name="search" /><input aria-label="Buscar clientes" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, teléfono o correo…" /></label><label className="crm-filter"><span className="visually-hidden">Filtrar por etapa</span><select className="form-select" value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">Todas las etapas</option>{CRM_STAGES.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label className="crm-filter"><span className="visually-hidden">Filtrar por seguimiento</span><select className="form-select" value={followUp} onChange={(event) => setFollowUp(event.target.value)}><option value="all">Todos los seguimientos</option><option value="today">Para hoy</option><option value="overdue">Vencidos</option><option value="upcoming">Próximos</option><option value="unscheduled">Sin programar</option></select></label></div>
      {loading ? <div className="crm-empty" role="status"><span className="spinner-border" /><h3>Cargando tu cartera…</h3></div> : error ? <div className="crm-empty" role="alert"><Icon name="cloud-slash" /><h3>No pudimos cargar tus clientes</h3><p>{error}</p><button className="btn btn-outline-dark" onClick={() => setRetry(retry + 1)}>Reintentar</button></div> : filtered.length === 0 ? <div className="crm-empty"><span className="crm-empty-icon"><Icon name={filteredActive ? 'search' : 'people'} /></span><h3>{filteredActive ? 'No encontramos coincidencias' : 'Tu próximo cliente empieza aquí'}</h3><p>{filteredActive ? 'Prueba otra búsqueda o cambia los filtros.' : 'Registra su información, vincula una cotización y programa el primer seguimiento.'}</p><button className="btn btn-primary" onClick={filteredActive ? reset : () => setEditor({})}>{filteredActive ? 'Limpiar filtros' : 'Registrar mi primer cliente'} <Icon name="arrow-right" /></button></div> : view === 'list' ? <div className="crm-table-wrap"><table className="crm-table"><caption className="visually-hidden">Cartera de clientes del asesor</caption><thead><tr><th>Cliente</th><th>Etapa</th><th>Valor estimado</th><th>Próximo seguimiento</th><th><span className="visually-hidden">Ver ficha</span></th></tr></thead><tbody>{filtered.map((client) => <tr key={client.id}><td><button className="crm-client-name" onClick={() => setSelection(client.id)}>{client.name}</button><span className="crm-client-subtitle">{client.city || client.interest || client.email || client.phone || 'Sin municipio'}</span></td><td><span className={`crm-stage crm-stage-${client.stage}`}>{stageLabel(client.stage)}</span></td><td className="crm-value">{money(client.value)}</td><td><FollowUp client={client} today={today} /><span className="crm-client-subtitle">{!isClosed(client) && client.nextAction}</span></td><td><button className="crm-icon-button" aria-label={`Ver ficha de ${client.name}`} onClick={() => setSelection(client.id)}><Icon name="arrow-up-right" /></button></td></tr>)}</tbody></table></div> : <div className="crm-board" aria-label="Oportunidades por etapa">{CRM_STAGES.filter((item) => stage === 'all' || stage === item.id).map((item) => { const cards = filtered.filter((client) => client.stage === item.id); return <section className="crm-column" key={item.id}><div className="crm-column-title"><span className={`crm-stage crm-stage-${item.id}`}>{item.label}</span><strong>{cards.length}</strong></div><p className="crm-column-total">{money(cards.reduce((sum, client) => sum + (Number(client.value) || 0), 0))}</p>{cards.length === 0 && <p className="crm-column-empty">Sin oportunidades</p>}{cards.map((client) => <button className="crm-opportunity" key={client.id} onClick={() => setSelection(client.id)}><strong>{client.name}</strong><span>{client.interest || client.city || 'Proyecto solar'}</span><b>{money(client.value)}</b><FollowUp client={client} today={today} /></button>)}</section>; })}</div>}
      {!loading && !error && filtered.length > 0 && <div className="crm-list-footer"><span>{filtered.length} de {clients.length} clientes</span>{filteredActive ? <button onClick={reset}>Limpiar filtros</button> : <span>Seguimientos en hora de Colombia</span>}</div>}
    </section>
    <aside className="crm-tip"><Icon name="lightning-charge" /><p><strong>Todo empieza con una buena conversación.</strong> Mantén el próximo paso actualizado para que ninguna oportunidad se quede sin seguimiento.</p><Link to="/dashboard">Ver cotizaciones <Icon name="arrow-right" /></Link></aside>
    {editor && <ClientForm key={editor.client?.id || 'new'} client={editor.client} initial={editor.initial} quotes={quotes} quotesError={quotesError} clients={clients} onClose={() => setEditor(null)} onSaved={saveFinished} />}
    {!editor && selected && <ClientDetail key={selected.id} client={selected} onClose={() => setSelection(null)} onEdit={() => setEditor({ client: selected })} onNotice={setNotice} />}
  </div>;
}
