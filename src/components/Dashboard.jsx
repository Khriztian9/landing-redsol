import React, { useEffect, useState } from "react";
import { auth, db, logout } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    // 🔹 Escuchar cambios en tiempo real de las cotizaciones del usuario
    const q = query(
    collection(db, "cotizaciones"),
    where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCotizaciones(docs);
      },
      (err) => {
        console.error("❌ Error cargando cotizaciones:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary fw-bold mb-4">Dashboard</h2>
      <p className="text-center mb-4">
        Hola, <strong>{auth.currentUser?.email}</strong>
      </p>

      <div className="card shadow p-4 mb-4">
        <h5 className="fw-bold text-primary mb-3">Tus cotizaciones</h5>

        {cotizaciones.length === 0 ? (
          <p className="text-muted">Aún no has guardado cotizaciones.</p>
        ) : (
          <div className="list-group">
            {cotizaciones.map((coti) => (
              <div
                key={coti.id}
                className="list-group-item list-group-item-action mb-2 border rounded shadow-sm"
              >
                <p className="mb-1">
                  <strong>📅 Fecha:</strong>{" "}
                  {coti.fecha?.toDate
                    ? coti.fecha.toDate().toLocaleString("es-CO")
                    : "Sin fecha"}
                </p>
                <ul className="list-unstyled mb-0">
                  <li>
                    💡 <strong>Potencia:</strong>{" "}
                    {coti.resultado?.potencia_kwp?.toFixed(2)} kWp
                  </li>
                  <li>
                    📋 <strong>Paneles:</strong> {coti.resultado?.numero_paneles}
                  </li>
                  <li>
                    💰 <strong>Precio:</strong>{" "}
                    {coti.resultado?.precio_total?.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
