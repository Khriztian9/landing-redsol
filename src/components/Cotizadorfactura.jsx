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

const CotizadorFactura = () => {
  const [file, setFile] = useState(null);
  const [estructura, setEstructura] = useState("trapezoidal");
  const [cubierta, setCubierta] = useState("fibrocemento");
  const [ubicacion, setUbicacion] = useState("risaralda");
  const [tipoInversor, setTipoInversor] = useState("ongrid");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("estructura", estructura);
    formData.append("cubierta", cubierta);
    formData.append("ubicacion", ubicacion);
    formData.append("tipoInversor", tipoInversor);

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
          nombre: res.data.nombre || "N/D",
          direccion: res.data.direccion || "N/D",
          municipio: res.data.municipio || "N/D",
          estrato: res.data.estrato || "N/D",
          tipo_servicio: res.data.tipo_servicio || "N/D",
          consumo_kwh: res.data.consumo_kwh,
          potencia_kwp: res.data.potencia_kwp,
          numero_paneles: res.data.numero_paneles,
          inversor: res.data.inversor_utilizado,
          precio_total: res.data.precio_total,
          costo_energia: res.data.costo_energia,
          generacion_mensual_min: res.data.generacion_mensual_min,
          generacion_mensual_max: res.data.generacion_mensual_max,
          estructura: estructura,
          cubierta: cubierta,
          ubicacion: ubicacion,
          tipoInversor: tipoInversor,
          ip: userIp,
          fecha: serverTimestamp(),
        });

        console.log("✅ Cotización guardada en Firestore con toda la info");
      }
    } catch (err) {
      console.error("❌ Error en CotizadorFactura:", err);
      setError("No se pudo procesar la factura. Verifica el archivo y vuelve a intentar.");
      setResultado(null);
    }
  };

  // 🔹 Exportar PDF
  const exportarPDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Cotización Solar FV", 15, 20);

    doc.setFontSize(11);
    doc.text(`Nombre: ${resultado.nombre || "N/D"}`, 15, 40);
    doc.text(`Dirección: ${resultado.direccion || "N/D"}`, 15, 50);
    doc.text(`Municipio: ${resultado.municipio || "N/D"}`, 15, 60);
    doc.text(`Estrato: ${resultado.estrato || "N/D"}`, 15, 70);
    doc.text(`Tipo servicio: ${resultado.tipo_servicio || "N/D"}`, 15, 80);

    doc.text(`Consumo mensual: ${resultado.consumo_kwh} kWh`, 15, 100);
    doc.text(`Potencia requerida: ${resultado.potencia_kwp} kWp`, 15, 110);
    doc.text(`Número de paneles: ${resultado.numero_paneles}`, 15, 120);
    doc.text(`Inversor: ${resultado.inversor_utilizado}`, 15, 130);
    doc.text(
      `Precio estimado: ${resultado.precio_total?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      })}`,
      15,
      140
    );

    doc.text(
      `Costo energía anual: ${resultado.costo_energia?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      })}`,
      15,
      150
    );

    if (resultado.generacion_mensual_min && resultado.generacion_mensual_max) {
      doc.text(
        `Generación anual: ${(resultado.generacion_mensual_min * 12).toFixed(0)} – ${(resultado.generacion_mensual_max * 12).toFixed(0)} kWh`,
        15,
        160
      );
    }

    doc.text(`Estructura: ${estructura}`, 15, 180);
    doc.text(`Cubierta: ${cubierta}`, 15, 190);
    doc.text(`Ubicación: ${ubicacion}`, 15, 200);
    doc.text(`Tipo inversor: ${tipoInversor}`, 15, 210);

    doc.save(`Cotizacion_${resultado.nombre || "cliente"}.pdf`);
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
              <option value="trapezoidal">Trapezoidal</option>
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

        <button type="submit" className="btn custom-cotizador-btn w-100">Calcular</button>
      </form>

      {/* Error */}
      {error && <div className="alert alert-danger" data-aos="fade-right">{error}</div>}

{/* Resultados en dos columnas */}
{resultado && (
  <div className="card shadow-lg p-4 mt-4 border-0" data-aos="fade-up">
    <h4 className="text-center mb-4 text-primary fw-bold">
      Resultados de la Cotización
    </h4>
    <div className="row">
      {/* Columna izquierda */}
      <div className="col-md-6">
        <p><span className="text-primary me-2">👤</span><strong>Nombre:</strong> {resultado.nombre}</p>
        <p><span className="text-primary me-2">🏠</span><strong>Dirección:</strong> {resultado.direccion}</p>
        <p><span className="text-primary me-2">📍</span><strong>Municipio:</strong> {resultado.municipio}</p>
        <p><span className="text-primary me-2">🏘️</span><strong>Estrato:</strong> {resultado.estrato}</p>
        <p><span className="text-primary me-2">🔌</span><strong>Tipo servicio:</strong> {resultado.tipo_servicio}</p>
        <p><span className="text-primary me-2">⚡</span><strong>Consumo mensual:</strong> {resultado.consumo_kwh} kWh</p>
      </div>

      {/* Columna derecha */}
      <div className="col-md-6">
        <p><span className="text-primary me-2">🔋</span><strong>Potencia requerida:</strong> {resultado.potencia_kwp} kWp</p>
        <p><span className="text-primary me-2">📦</span><strong>Número de paneles:</strong> {resultado.numero_paneles}</p>
        <p><span className="text-primary me-2">⚙️</span><strong>Inversor:</strong> {resultado.inversor_utilizado}</p>
        <p><span className="text-primary me-2">💰</span><strong>Precio estimado:</strong> {resultado.precio_total?.toLocaleString("es-CO", {style:"currency",currency:"COP"})}</p>
        <p><span className="text-primary me-2">🔆</span><strong>Generación anual:</strong>{" "}
          {resultado.generacion_mensual_min && resultado.generacion_mensual_max
            ? `${(resultado.generacion_mensual_min * 12).toFixed(0)} – ${(resultado.generacion_mensual_max * 12).toFixed(0)} kWh`
            : "N/D"}
        </p>
      </div>
    </div>

    <div className="text-center mt-4">
      <button className="btn btn-primary px-4 shadow-sm" onClick={exportarPDF}>
        Descargar PDF
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default CotizadorFactura;
