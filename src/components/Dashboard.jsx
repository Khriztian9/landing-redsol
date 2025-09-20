import React, { useEffect, useState } from "react";
import { auth, db, logout } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Dashboard = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "cotizaciones"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCotizaciones(docs);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // 🔹 Exportar comprobante con template corporativo
  const exportarComprobante = (coti) => {
    const doc = new jsPDF();
    const precio = coti.precio_total || 0;
    const comision = precio * 0.05; // % ajustable
    const fecha = coti.fecha?.toDate
      ? coti.fecha.toDate().toLocaleDateString("es-CO")
      : "Sin fecha";

    // ===========================
    // 1. ENCABEZADO
    // ===========================
    const logoUrl = "/logo.png"; // coloca tu logo en /public/logo.png
    doc.setFillColor(13, 110, 253); // Azul corporativo
    doc.rect(0, 0, 210, 35, "F");

    try {
      doc.addImage(logoUrl, "PNG", 15, 5, 25, 25);
    } catch (e) {
      console.warn("Logo no encontrado, asegúrate de poner /public/logo.png");
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("REDSOL COLOMBIA S.A.S.", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Soluciones Fotovoltaicas", 105, 25, { align: "center" });

    // ===========================
    // 2. TÍTULO DEL DOCUMENTO
    // ===========================
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(" Comprobante de Gestión Comercial", 105, 50, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Documento interno para cobro de comisión", 105, 58, {
      align: "center",
    });

    // ===========================
    // 3. TABLA CON INFORMACIÓN
    // ===========================
    doc.autoTable({
      startY: 70,
      theme: "striped",
      head: [["Campo", "Detalle"]],
      body: [
        ["Fecha", fecha],
        ["Cliente", coti.nombre || "N/D"],
        ["Email", coti.email || "N/D"],
        ["Municipio", coti.municipio || "N/D"],
        ["Dirección", coti.direccion || "N/D"],
        ["Estrato", coti.estrato || "N/D"],
        ["Potencia", `${coti.potencia_kwp} kWp`],
        ["Paneles", coti.numero_paneles || "N/D"],
        ["Inversor", coti.inversor || "N/D"],
        ["Estructura", coti.estructura || "N/D"],
        ["Cubierta", coti.cubierta || "N/D"],
        ["Ubicación", coti.ubicacion || "N/D"],
        [
          "Valor del proyecto",
          precio.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }),
        ],
        [
          "Comisión aproximada (5%)",
          comision.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }),
        ],
      ],
      headStyles: { fillColor: [13, 110, 253], halign: "center" },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // ===========================
    // 4. FIRMA
    // ===========================
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("_________________________", 20, finalY);
    doc.text("Firma del gestor", 20, finalY + 10);

    // ===========================
    // 5. PIE DE PÁGINA FIJO
    // ===========================
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 25, 210, 25, "F");

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(" Av. Las Américas #50-03, Pereira, Colombia", 105, pageHeight - 15, {
      align: "center",
    });
    doc.text(" +57 300 123 4567 |  contacto@redsol.com", 105, pageHeight - 8, {
      align: "center",
    });

    // Guardar
    doc.save(`Comprobante_${coti.nombre || "cliente"}_${coti.id}.pdf`);
  };

  return (
    <div className="container py-5 dashboard-container">
      <h2 className="text-center text-primary fw-bold mb-4">Dashboard</h2>
      <p className="text-center mb-4">
        Hola, <strong>{auth.currentUser?.email}</strong>
      </p>

      <div className="card shadow p-4 mb-4">
        <h5 className="fw-bold text-primary mb-3">Tus cotizaciones</h5>

        {cotizaciones.length === 0 ? (
          <p className="text-muted">Aún no has guardado cotizaciones.</p>
        ) : (
          <div className="accordion" id="accordionCotizaciones">
            {cotizaciones.map((coti, index) => (
              <div className="accordion-item mb-3" key={coti.id}>
                <h2 className="accordion-header" id={`heading-${index}`}>
                  <button
                    className="accordion-button collapsed custom-accordion-btn"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${index}`}
                  >
                     {coti.nombre} –{" "}
                    {coti.fecha?.toDate
                      ? coti.fecha.toDate().toLocaleDateString("es-CO")
                      : "Sin fecha"}
                  </button>
                </h2>
                <div
                  id={`collapse-${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${index}`}
                  data-bs-parent="#accordionCotizaciones"
                >
                  <div className="accordion-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Email:</strong> {coti.email}</p>
                        <p><strong>Dirección:</strong> {coti.direccion}</p>
                        <p><strong>Municipio:</strong> {coti.municipio}</p>
                        <p><strong>Estrato:</strong> {coti.estrato}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Consumo:</strong> {coti.consumo_kwh} kWh</p>
                        <p><strong>Potencia:</strong> {coti.potencia_kwp} kWp</p>
                        <p><strong>Paneles:</strong> {coti.numero_paneles}</p>
                        <p>
                          <strong>Precio:</strong>{" "}
                          {coti.precio_total?.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-end mt-3">
                      <button
                        className="btn btn-sm btn-outline-success custom-pdf-btn"
                        onClick={() => exportarComprobante(coti)}
                      >
                         Descargar comprobante
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <button className="btn btn-danger custom-logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
