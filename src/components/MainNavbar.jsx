import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';

function MainNavbar({ user, onLoginClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav id="mainNavbar" className="main-navbar" aria-label="Navegación principal">
      <div className="container navbar-layout">
        <a className="brand-home" href={user ? '/dashboard' : '#inicio'} aria-label="REDSOLAR, inicio" onClick={closeMenu}>
          <BrandLogo />
        </a>
        <button className="menu-toggle" type="button" aria-controls="navbarContent" aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
        </button>
        <div id="navbarContent" className={`main-menu ${menuOpen ? 'is-open' : ''}`}>
          {!user ? (
            <>
              <a href="#servicios" onClick={closeMenu}>Soluciones</a>
              <a href="#proyectos" onClick={closeMenu}>Proyectos</a>
              <a href="#contacto" onClick={closeMenu}>Contacto</a>
              <button className="advisor-login" type="button" onClick={() => { closeMenu(); onLoginClick(); }}>
                <i className="bi bi-person" aria-hidden="true" /> Asesores
              </button>
              <a className="btn btn-redsolar-primary nav-quote" href="#cotizador-factura" onClick={closeMenu}>
                Cotiza tu proyecto <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" onClick={closeMenu}>Historial</NavLink>
              <NavLink to="/app" onClick={closeMenu}>Calculadora</NavLink>
              <span className="nav-account">{user.email}</span>
              <button className="btn btn-outline-primary" onClick={onLogout}>Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;
