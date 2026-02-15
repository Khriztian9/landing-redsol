import { NavLink } from 'react-router-dom';

function MainNavbar({ user, onLoginClick, onLogout }) {
  return (
    <nav
      id="mainNavbar"
      aria-label="Navegación principal"
      className={`navbar navbar-expand-lg fixed-top transition-navbar ${
        user ? 'bg-white border-bottom' : 'navbar-transparent'
      }`}
    >
      <div className="container py-2">
        <a className="navbar-brand text-primary fw-bold fs-4" href={user ? '/dashboard' : '#'}>
          REDSOL
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto gap-3 align-items-center">
            {!user && (
              <>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#cotizador-factura">Cotizador</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#servicios">Servicios</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#proyectos">Proyectos</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#cobertura">Cobertura</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#faq-solar">FAQ</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#contacto">Contacto</a></li>
                <li className="nav-item">
                  <button className="btn btn-outline-primary btn-sm" onClick={onLoginClick}>
                    Login
                  </button>
                </li>
              </>
            )}

            {user && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary fw-bold' : 'text-secondary'}`}
                  >
                    Historial
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/app"
                    className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary fw-bold' : 'text-secondary'}`}
                  >
                    Calculadora
                  </NavLink>
                </li>

                <li className="nav-item d-flex align-items-center">
                  <span className="fw-bold text-primary me-2" style={{ fontSize: 12 }}>
                    {user.email}
                  </span>
                  <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;
