import React, { useEffect, useState } from "react";
import { logout } from "../firebase";
import { db } from "../firestore";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PDF_BRAND_COLORS as COLORS, drawBrandLogo, loadBrandLogo } from "../utils/brandPdf";

const Dashboard = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const linkedQuoteId = hash.startsWith("#quote-") ? hash.slice(7) : "";

  useEffect(() => {
    if (!linkedQuoteId || loading) return;
    document.getElementById(`quote-${linkedQuoteId}`)?.scrollIntoView({ block: "center" });
  }, [linkedQuoteId, loading]);

  useEffect(() => {
    const q = query(
      collection(db, "cotizaciones"),
      where("userId", "==", user.uid),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCotizaciones(docs);
      setLoading(false);
      setError("");
    }, (snapshotError) => {
      setCotizaciones([]);
      setLoading(false);
      setError(snapshotError.code === "permission-denied"
        ? "No tienes permiso para consultar estas cotizaciones. Comunícate con el administrador."
        : "No pudimos cargar tus cotizaciones. Recarga la página para intentarlo de nuevo.");
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // 🔹 Exportar comprobante con template corporativo
  const exportarComprobante = async (coti) => {
    const doc = new jsPDF();
    const logo = await loadBrandLogo();
    const precio = coti.precio_total || 0;
    const comision = precio * 0.05; // % ajustable
    const fecha = coti.fecha?.toDate
      ? coti.fecha.toDate().toLocaleDateString("es-CO")
      : "Sin fecha";

    // ===========================
    // 1. ENCABEZADO
    // ===========================
    doc.setFillColor(...COLORS.black);
    doc.rect(0, 0, 210, 35, "F");
    doc.setFillColor(...COLORS.red);
    doc.rect(0, 34, 210, 1, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    if (!drawBrandLogo(doc, logo, { x: 69, y: 9, width: 72 })) {
      doc.text("REDSOLAR S.A.S.", 105, 15, { align: "center" });
    }

    doc.setFontSize(12);
    doc.text("Soluciones Fotovoltaicas", 105, 25, { align: "center" });

    // ===========================
    // 2. TÍTULO DEL DOCUMENTO
    // ===========================
    doc.setTextColor(36, 39, 43);
    doc.setFontSize(16);
    doc.text(" Comprobante de Gestión Comercial", 105, 50, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...COLORS.muted);
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
      headStyles: { fillColor: COLORS.black, halign: "center" },
      bodyStyles: { textColor: COLORS.ink },
      alternateRowStyles: { fillColor: COLORS.surface },
    });

    // ===========================
    // 4. FIRMA
    // ===========================
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFontSize(11);
    doc.setTextColor(36, 39, 43);
    doc.text("_________________________", 20, finalY);
    doc.text("Firma del gestor", 20, finalY + 10);

    // ===========================
    // 5. PIE DE PÁGINA FIJO
    // ===========================
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...COLORS.surface);
    doc.rect(0, pageHeight - 25, 210, 25, "F");

    doc.setFontSize(9);
    doc.setTextColor(36, 39, 43);
    doc.text(" Av. Las Américas #50-03, Pereira, Colombia", 105, pageHeight - 15, {
      align: "center",
    });
    doc.text(" +57 318 346 4183 | info@redsolarenergy.com", 105, pageHeight - 8, {
      align: "center",
    });

    // Guardar
    doc.save(`Comprobante_${coti.nombre || "cliente"}_${coti.id}.pdf`);
  };

  return (
    <div className="container py-5 dashboard-container">
      <span className="workspace-eyebrow">REDSOLAR / Historial</span>
      <h1 className="dashboard-title">Tus cotizaciones</h1>
      <p className="text-center mb-4">
        Hola, <strong>{user.email}</strong>
      </p>

      <div className="card shadow p-4 mb-4">
        <h5 className="fw-bold text-primary mb-3">Tus cotizaciones</h5>

        {loading ? (
          <p className="text-muted" role="status">Cargando tus cotizaciones…</p>
        ) : error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : cotizaciones.length === 0 ? (
          <p className="text-muted">Aún no has guardado cotizaciones.</p>
        ) : (
          <div className="accordion" id="accordionCotizaciones">
            {cotizaciones.map((coti, index) => (
              <div className="accordion-item mb-3" id={`quote-${coti.id}`} key={coti.id}>
                <h2 className="accordion-header" id={`heading-${index}`}>
                  <button
                    className={`accordion-button custom-accordion-btn ${coti.id === linkedQuoteId ? "" : "collapsed"}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${index}`}
                    aria-expanded={coti.id === linkedQuoteId}
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
                  className={`accordion-collapse collapse ${coti.id === linkedQuoteId ? "show" : ""}`}
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

                    <div className="d-flex justify-content-end flex-wrap gap-2 mt-3">
                      <Link className="btn btn-sm btn-primary" to={`/crm?quote=${encodeURIComponent(coti.id)}`}>
                        Llevar al CRM <i className="bi bi-arrow-right" aria-hidden="true" />
                      </Link>
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
