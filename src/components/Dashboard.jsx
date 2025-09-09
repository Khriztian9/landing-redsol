import React, { useEffect, useState } from "react";
import { auth, db, logout } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const Dashboard = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    // 🔹 Solo muestra cotizaciones del usuario actual
    const q = query(
      collection(db, "cotizaciones"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("fecha", "desc")
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

  // 🔹 Exportar cotización a PDF
  const exportarPDF = (coti) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(" Cotización Solar FV", 15, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${coti.fecha?.toDate ? coti.fecha.toDate().toLocaleString("es-CO") : "Sin fecha"}`, 15, 30);
    doc.text(`Nombre: ${coti.nombre}`, 15, 40);
    doc.text(`Email: ${coti.email}`, 15, 50);
    doc.text(`Dirección: ${coti.direccion}`, 15, 60);
    doc.text(`Municipio: ${coti.municipio}`, 15, 70);
    doc.text(`Estrato: ${coti.estrato}`, 15, 80);
    doc.text(`Tipo servicio: ${coti.tipo_servicio}`, 15, 90);

    doc.text(`Consumo mensual: ${coti.consumo_kwh} kWh`, 15, 110);
    doc.text(`Potencia requerida: ${coti.potencia_kwp} kWp`, 15, 120);
    doc.text(`Número de paneles: ${coti.numero_paneles}`, 15, 130);
    doc.text(`Inversor propuesto: ${coti.inversor}`, 15, 140);

    doc.text(
      `Precio estimado: ${coti.precio_total?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      })}`,
      15,
      150
    );

    doc.text(
      `Costo energía anual: ${coti.costo_energia?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      })}`,
      15,
      160
    );

    if (coti.generacion_mensual_min && coti.generacion_mensual_max) {
      doc.text(
        `Generación anual: ${(coti.generacion_mensual_min * 12).toFixed(0)} – ${(coti.generacion_mensual_max * 12).toFixed(0)} kWh`,
        15,
        170
      );
    }

    doc.text(`Estructura: ${coti.estructura}`, 15, 190);
    doc.text(`Cubierta: ${coti.cubierta}`, 15, 200);
    doc.text(`Ubicación: ${coti.ubicacion}`, 15, 210);
    doc.text(`Tipo inversor: ${coti.tipoInversor}`, 15, 220);
    doc.text(` IP: ${coti.ip}`, 15, 230);

    doc.save(`Cotizacion_${coti.nombre || "cliente"}_${coti.id}.pdf`);
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
                className="list-group-item list-group-item-action mb-3 border rounded shadow-sm"
              >
                <p className="mb-1">
                  <strong>📅 Fecha:</strong>{" "}
                  {coti.fecha?.toDate
                    ? coti.fecha.toDate().toLocaleString("es-CO")
                    : "Sin fecha"}
                </p>
                <ul className="list-unstyled mb-0">
                  <li>👤 <strong>Nombre:</strong> {coti.nombre}</li>
                  <li>📧 <strong>Email:</strong> {coti.email}</li>
                  <li>🏠 <strong>Dirección:</strong> {coti.direccion}</li>
                  <li>📍 <strong>Municipio:</strong> {coti.municipio}</li>
                  <li>📶 <strong>Estrato:</strong> {coti.estrato}</li>
                  <li>🔌 <strong>Tipo servicio:</strong> {coti.tipo_servicio}</li>
                  <li>⚡ <strong>Consumo mensual:</strong> {coti.consumo_kwh} kWh</li>
                  <li>🔋 <strong>Potencia:</strong> {coti.potencia_kwp} kWp</li>
                  <li>📋 <strong>Paneles:</strong> {coti.numero_paneles}</li>
                  <li>⚙️ <strong>Inversor:</strong> {coti.inversor}</li>
                  <li>💰 <strong>Precio:</strong>{" "}
                    {coti.precio_total?.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </li>
                  <li>💸 <strong>Costo energía anual:</strong> 
                    {coti.costo_energia?.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </li>
                  <li>🔆 <strong>Generación anual:</strong>{" "}
                    {coti.generacion_mensual_min && coti.generacion_mensual_max
                      ? `${(coti.generacion_mensual_min * 12).toFixed(0)} – ${(coti.generacion_mensual_max * 12).toFixed(0)} kWh`
                      : "N/D"}
                  </li>
                  <li>🏗️ <strong>Estructura:</strong> {coti.estructura}</li>
                  <li>🪟 <strong>Cubierta:</strong> {coti.cubierta}</li>
                  <li>🌎 <strong>Ubicación:</strong> {coti.ubicacion}</li>
                  <li>🔧 <strong>Tipo inversor:</strong> {coti.tipoInversor}</li>
                  <li>🌍 <strong>IP:</strong> {coti.ip}</li>
                </ul>
                <div className="mt-3 text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => exportarPDF(coti)}
                  >
                    📄 Exportar PDF
                  </button>
                </div>
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
