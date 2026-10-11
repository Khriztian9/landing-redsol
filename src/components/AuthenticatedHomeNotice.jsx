import { Link } from 'react-router-dom';
import './Dashboard.css';

function AuthenticatedHomeNotice() {
  return (
    <main id="contenido-principal" className="container authenticated-notice">
      <span className="workspace-eyebrow">Tu espacio REDSOLAR</span>
      <h1>Tu próximo proyecto empieza aquí.</h1>
      <p>Organiza tus clientes, oportunidades y seguimientos, y consulta tus cotizaciones solares.</p>
      <div className="authenticated-actions">
        <Link className="btn btn-primary" to="/crm">Abrir mi CRM <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        <Link className="btn btn-outline-dark" to="/dashboard">Ver mis cotizaciones</Link>
      </div>
    </main>
  );
}

export default AuthenticatedHomeNotice;
