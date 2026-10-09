import { Link } from 'react-router-dom';
import './Dashboard.css';

function AuthenticatedHomeNotice() {
  return (
    <main id="contenido-principal" className="container authenticated-notice">
      <span className="workspace-eyebrow">Tu espacio REDSOLAR</span>
      <h1>Tu próximo proyecto empieza aquí.</h1>
      <p>Consulta tus cotizaciones o explora el potencial financiero de una instalación solar.</p>
      <div className="authenticated-actions">
        <Link className="btn btn-primary" to="/dashboard">Ver mis cotizaciones <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        <Link className="btn btn-outline-dark" to="/app">Abrir calculadora</Link>
      </div>
    </main>
  );
}

export default AuthenticatedHomeNotice;
