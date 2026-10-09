// src/components/PrivateLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logout } from "../firebase";
import BrandLogo from "./BrandLogo";
import "./Dashboard.css";

export default function PrivateLayout() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setChecking(false);
      if (!u) navigate("/", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (checking) {
    return (
      <div className="workspace-loading" role="status">
        <BrandLogo />
        <div className="spinner-border" aria-hidden="true" />
        <p>Preparando tu espacio de trabajo…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="redsolar-workspace">
      <a href="#workspace-content" className="visually-hidden-focusable workspace-skip">Saltar al contenido</a>
      <nav className="workspace-nav" aria-label="Navegación de herramientas">
        <div className="container workspace-nav-inner">
          <NavLink to="/dashboard" className="workspace-brand" aria-label="REDSOLAR · Inicio">
            <BrandLogo />
          </NavLink>

          <button
            className="workspace-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="privateNavbar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
            <span>{menuOpen ? 'Cerrar' : 'Menú'}</span>
          </button>

          <div className={`workspace-nav-menu ${menuOpen ? 'is-open' : ''}`} id="privateNavbar">
            <ul className="workspace-nav-links">
              <li className="nav-item">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `workspace-nav-link ${isActive ? "is-active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Historial
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/app"
                  className={({ isActive }) =>
                    `workspace-nav-link ${isActive ? "is-active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Calculadora
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/cotizador"
                  className={({ isActive }) =>
                    `workspace-nav-link ${isActive ? "is-active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Cotizador
                </NavLink>
              </li>

            </ul>
            <div className="workspace-account">
              <span className="workspace-email" title={user?.email}>{user?.email}</span>
              <button className="workspace-logout" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="workspace-heading">
        <div className="container">
          <span>REDSOLAR / Herramientas</span>
          <NavLink to="/">Ver sitio web <i className="bi bi-arrow-up-right" aria-hidden="true" /></NavLink>
        </div>
      </div>
      <main id="workspace-content" className="container workspace-content" tabIndex="-1">
        <Outlet />
      </main>
      <footer className="workspace-footer container">
        <span>REDSOLAR · Soluciones fotovoltaicas</span>
        <span>Energía solar en Colombia</span>
      </footer>
    </div>
  );
}
