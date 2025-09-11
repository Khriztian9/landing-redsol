import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CotizadorFactura.css";

// Firebase
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CotizadorFactura = () => {
  const [file, setFile] = useState(null);
  const [estructura, setEstructura] = useState("trapezoidal");
  const [cubierta, setCubierta] = useState("fibrocemento");
  const [ubicacion, setUbicacion] = useState("risaralda");
  const [tipoInversor, setTipoInversor] = useState("ongrid");
  const [porcentajeGeneracion, setPorcentajeGeneracion] = useState(100); // NUEVO
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Validación archivo PDF
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      setFile(null);
      return;
    }
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError("El archivo no debe superar los 5MB.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const getUserIP = async () => {
    try {
      const res = await fetch("https://api64.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "IP no disponible";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("estructura", estructura);
    formData.append("cubierta", cubierta);
    formData.append("ubicacion", ubicacion);
    formData.append("tipoInversor", tipoInversor);
    formData.append("porcentajeGeneracion", porcentajeGeneracion); // NUEVO


    try {
      const res = await axios.post("http://127.0.0.1:8000/procesar-factura", formData);
      if (!res.data) throw new Error("El servidor no devolvió resultados");

      setResultado(res.data);
      setError(null);

      if (auth.currentUser) {
        const userIp = await getUserIP();

        await addDoc(collection(db, "cotizaciones"), {
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          ...res.data,
          estructura,
          cubierta,
          ubicacion,
          tipoInversor,
          porcentajeGeneracion, // guardamos también
          ip: userIp,
          fecha: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("❌ Error en CotizadorFactura:", err);
      setError("No se pudo procesar la factura. Verifica el archivo y vuelve a intentar.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

// 🔹 Exportar PDF en horizontal con portada + tablas en una sola página
const exportarPDF = () => {
  if (!resultado) return;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const COMPANY = {
    name: "REDSOL COLOMBIA S.A.S.",
    phone: "+57 318 346 4183",
    email: "info@redsolcolombia.com",
    website: "www.redsolcolombia.com",
    address: "Av. Las Américas #50-03, Pereira, Risaralda",
    slogan: "Energía solar a tu alcance",
  };

  const COLORS = {
    primary: [13, 110, 253],
    accent: [32, 201, 151],
    dark: [33, 37, 41],
    gray: [108, 117, 125],
  };

  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  const formatCOP = (n) =>
    (n ?? 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  // ——— Cargar imagen banner ———
  const banner = new Image();
  banner.src = "/solar-bg.jpg"; // 🔹 coloca solar-bg.jpg en /public

  banner.onload = () => {
    // ====== PORTADA ======
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 297, 22, "F"); // barra superior
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY.name, 12, 14);

    // Banner
    doc.addImage(banner, "JPEG", 0, 22, 297, 100);

    // Texto sobre la portada
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(22);
    doc.text("Propuesta Técnico–Económica", 15, 140);
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.gray);
    doc.text(COMPANY.slogan, 15, 150);

    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text(`Cliente: ${resultado.nombre || "N/D"}`, 15, 170);
    doc.text(`Fecha: ${fecha}`, 15, 178);
    doc.text(`Asesor: ${auth?.currentUser?.email || "—"}`, 15, 186);
    

    // ====== SEGUNDA PÁGINA ======
    doc.addPage("a4", "landscape");

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 297, 12, "F");
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.text("Cotización Solar FV", 12, 8);

    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", "bold");

    // 📌 Datos del Cliente
    doc.setFontSize(13);
    doc.text("Datos del Cliente", 15, 22);
    autoTable(doc, {
      startY: 28,
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [["Campo", "Valor"]],
      body: [
        ["Nombre", resultado.nombre || "N/D"],
        ["Dirección", resultado.direccion || "N/D"],
        ["Municipio", resultado.municipio || "N/D"],
        ["Estrato", resultado.estrato || "N/D"],
        ["Tipo servicio", resultado.tipo_servicio || "N/D"],
      ],
    });

    // ⚡ Resultados Técnicos
    doc.text("Resultados Técnicos", 15, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [["Parámetro", "Valor"]],
      body: [
        ["Consumo mensual", `${resultado.consumo_kwh} kWh`],
        ["Potencia requerida", `${resultado.potencia_kwp} kWp`],
        ["Número de paneles", `${resultado.numero_paneles}`],
        ["Inversor", `${resultado.inversor_utilizado}`],
        ["Generación mensual", `${resultado.generacion_mensual_min.toFixed(2)} - ${resultado.generacion_mensual_max.toFixed(2)} kWh`   ],
        ["Porcentaje de cobertura", `${resultado.porcentaje_generacion ?? porcentajeGeneracion}%`], // ✅ corregido

      ],
    });

    // 💰 Inversión
    doc.text("Inversión", 15, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [["Concepto", "Valor"]],
      body: [
        ["Precio estimado del sistema", formatCOP(resultado.precio_total)],
        ["Costo energía anual (referencial)", formatCOP(resultado.costo_energia)],
      ],
    });

    // Condiciones
    doc.text("Condiciones del Proyecto", 15, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
      theme: "striped",
      headStyles: { fillColor: COLORS.primary, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [["Parámetro", "Valor"]],
      body: [
        ["Estructura", estructura],
        ["Cubierta", cubierta],
        ["Ubicación", ubicacion],
        ["Tipo inversor", tipoInversor],
      ],
    });

    // Footer corporativo
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `${COMPANY.website} · ${COMPANY.email} · ${COMPANY.phone}`,
        148,
        200,
        { align: "center" }
      );
      doc.text(`Página ${i} de ${pageCount}`, 280, 200, { align: "right" });
    }

    doc.save(`Cotizacion_${resultado.nombre || "cliente"}.pdf`);
  };

  // Si la imagen falla → genera sin banner
  banner.onerror = () => {
    console.warn("⚠️ No se pudo cargar el banner, generando PDF sin imagen.");
    doc.save(`Cotizacion_${resultado.nombre || "cliente"}.pdf`);
  };
};

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center text-primary" data-aos="fade-down">
        Cotizador Solar desde Factura
      </h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card p-4 shadow mb-4" data-aos="fade-up">
        <div className="mb-3">
          <label className="form-label">Factura en PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="form-control" required />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Estructura</label>
            <select className="form-select" value={estructura} onChange={(e) => setEstructura(e.target.value)}>
              <option value="madera">Madera</option>
              <option value="cercha">Cercha</option>
              <option value="granja">Granja</option>
              <option value="plancha">Plancha</option>
              <option value="perfil_metalico">Perfil Metálico</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Cubierta</label>
            <select className="form-select" value={cubierta} onChange={(e) => setCubierta(e.target.value)}>
              <option value="fibrocemento">Fibrocemento</option>
              <option value="teja_colonial">Teja Colonial</option>
              <option value="trapezoidal">Trapezoidal</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Ubicación</label>
            <select className="form-select" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <option value="risaralda">Risaralda</option>
              <option value="quindio">Quindío</option>
              <option value="valle">Valle</option>
              <option value="caldas">Caldas</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Tipo de inversor</label>
            <select className="form-select" value={tipoInversor} onChange={(e) => setTipoInversor(e.target.value)}>
              <option value="ongrid">On Grid</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        {/* NUEVO: Slider de cobertura */}
        <div className="mb-3">
          <label className="form-label d-flex justify-content-between">
            <span>Cobertura de generación</span>
            <span className="fw-bold">{porcentajeGeneracion}%</span>
          </label>
          <input
            type="range"
            className="form-range"
            min="50"
            max="200"
            step="50"
            value={porcentajeGeneracion}
            onChange={(e) => setPorcentajeGeneracion(parseInt(e.target.value, 10))}
          />
          <div className="d-flex justify-content-between small text-muted mt-1">
            <span>50%</span><span>100%</span><span>150%</span><span>200%</span>
          </div>
        </div>
      

        <button
  type="submit"
  className="btn custom-cotizador-btn w-100"
  disabled={loading}
>
  {loading ? (
    <>
      Procesando...
      <span className="loader"></span>
    </>
  ) : (
    "Calcular"
  )}
</button>


      </form>

      {error && <div className="alert alert-danger" data-aos="fade-right">{error}</div>}

      {resultado && (
        <div className="card shadow-lg p-4 mt-4 border-0" data-aos="fade-up">
          <h4 className="text-center mb-4 text-primary fw-bold">
            Resultados de la Cotización
          </h4>
          <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-primary text-center">
          <tr>
            <th>Parámetro</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>👤 Nombre</td>
            <td>{resultado.nombre}</td>
          </tr>
          <tr>
            <td>🏠 Dirección</td>
            <td>{resultado.direccion}</td>
          </tr>
          <tr>
            <td>📍 Municipio</td>
            <td>{resultado.municipio}</td>
          </tr>
          <tr>
            <td>🏘️ Estrato</td>
            <td>{resultado.estrato}</td>
          </tr>
          <tr>
            <td>🔌 Tipo de servicio</td>
            <td>{resultado.tipo_servicio}</td>
          </tr>
          <tr>
            <td>⚡ Consumo mensual</td>
            <td>{resultado.consumo_kwh.toFixed(0)} kWh</td>
          </tr>
          <tr className="table-success">
            <td>🔋 Potencia requerida</td>
            <td>{resultado.potencia_kwp} kWp</td>
          </tr>
          <tr className="table-success">
            <td>📦 Número de paneles</td>
            <td>{resultado.numero_paneles}</td>
          </tr>
          <tr className="table-success">
            <td>⚙️ Inversor</td>
            <td>{resultado.inversor_utilizado}</td>
          </tr>
          <tr className="table-success">
            <td>💰 Precio estimado</td>
            <td>
              {resultado.precio_total?.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </td>
          </tr>
          <tr>
            <td>🔆 Generación mensual</td>
            <td>
              {resultado.generacion_mensual_min && resultado.generacion_mensual_max
                ? `${(resultado.generacion_mensual_min ).toFixed(0)} – ${(resultado.generacion_mensual_max ).toFixed(0)} kWh`
                : "N/D"}
            </td>
          </tr>
          <tr>
            <td>💡 Cobertura</td>
            <td>{resultado.porcentaje_generacion ?? porcentajeGeneracion}%</td>
          </tr>
        </tbody>
      </table>
    </div>

          <div className="text-center mt-4">
            <button className="btn btn-primary px-4 shadow-sm" onClick={exportarPDF}>
              📄 Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizadorFactura;
