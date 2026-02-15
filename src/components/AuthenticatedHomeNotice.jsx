import { Link } from 'react-router-dom';

function AuthenticatedHomeNotice() {
  return (
    <div style={{ paddingTop: 90 }} className="container">
      <div className="alert alert-info">
        Sesión activa. Ve a <Link to="/dashboard">Historial</Link> o <Link to="/app">Calculadora</Link>.
      </div>
    </div>
  );
}

export default AuthenticatedHomeNotice;
