// src/components/PrivateLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, logout } from "../firebase";

export default function PrivateLayout() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
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
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container py-2">
          <NavLink to="/dashboard" className="navbar-brand text-primary fw-bold fs-4">
            RED SOL
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#privateNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="privateNavbar">
            <ul className="navbar-nav ms-auto gap-3 align-items-center">
              <li className="nav-item">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "text-primary fw-bold" : "text-secondary"}`
                  }
                >
                  Historial
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/app"
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "text-primary fw-bold" : "text-secondary"}`
                  }
                >
                  Calculadora
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/cotizador"
                  className={({ isActive }) =>
                    `nav-link fw-medium ${isActive ? "text-primary fw-bold" : "text-secondary"}`
                  }
                >
                  Cotizador
                </NavLink>
              </li>

              <li className="nav-item d-flex align-items-center">
                <span className="fw-bold text-primary me-2" style={{ fontSize: 12 }}>
                  {user?.email}
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
}
