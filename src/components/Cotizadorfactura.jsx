import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CotizadorFactura.css";

// Firebase
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { generateQuotePdf } from "../utils/generateQuotePdf";

const CotizadorFactura = () => {
  const [file, setFile] = useState(null);
  const [estructura, setEstructura] = useState("trapezoidal");
  const [cubierta, setCubierta] = useState("fibrocemento");
  const [ubicacion, setUbicacion] = useState("risaralda");
  const [tipoInversor, setTipoInversor] = useState("ongrid");
  const [porcentajeGeneracion, setPorcentajeGeneracion] = useState(100);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // === modo Factura/Datos y formulario manual ===
  const [modo, setModo] = useState("factura"); // "factura" | "datos"
  const [manual, setManual] = useState({
    nombre: "",
    direccion: "",
    municipio: "",
    estrato: "1",
    tipo_servicio: "Residencial",
    consumo_kwh: "",
    valor_kwh: "" // tarifa base SIN contribución
  });

  const esResidencial = manual.tipo_servicio === "Residencial";
  useEffect(() => {
    if (!esResidencial) setManual((prev) => ({ ...prev, estrato: "" }));
  }, [esResidencial]);

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManual((prev) => ({ ...prev, [name]: value }));
  };


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

  // ✅ SessionId persistente para cotizaciones anónimas
  const getSessionId = () => {
    const key = "redsolar_session_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id =
        crypto?.randomUUID?.() ||
        `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  };

  // ✅ Guardar cotización con o sin usuario
  const guardarCotizacion = async (resData) => {
    const userIp = await getUserIP();
    const sessionId = getSessionId();

    const docData = {
      // lo que devuelve el backend
      ...resData,

      // parámetros y selección del usuario
      estructura,
      cubierta,
      ubicacion,
      tipoInversor,
      porcentajeGeneracion,
      modo,

      // trazabilidad
      ip: userIp,
      sessionId,
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      fecha: serverTimestamp(),

      // ✅ guardar lo que el usuario escribió (solo en modo "datos")
      manual:
        modo === "datos"
          ? {
              nombre: manual.nombre || "No disponible",
              direccion: manual.direccion || "No disponible",
              municipio: manual.municipio || "No disponible",
              estrato: manual.estrato || "0",
              tipo_servicio: manual.tipo_servicio || "Residencial",
              consumo_kwh: Number(manual.consumo_kwh || 0),
              valor_kwh: manual.valor_kwh ? Number(manual.valor_kwh) : null,
            }
          : null,

      // ✅ guardar info del archivo (por si luego quieres enlazarlo a Storage)
      fileInfo:
        modo === "factura" && file
          ? { name: file.name, size: file.size, type: file.type }
          : null,
    };

    // ✅ Si hay usuario: guardas donde ya guardabas
    if (auth.currentUser) {
      await addDoc(collection(db, "cotizaciones"), docData);
    } else {
      // ✅ Si NO hay usuario: guardas anónima
      await addDoc(collection(db, "cotizaciones_publicas"), docData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);
    setError(null);

    try {
      let res;

      if (modo === "factura") {
        // ✅ validación: si estás en modo factura, exige archivo
        if (!file) {
          setError("Debes seleccionar un PDF para procesar la factura.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("estructura", estructura);
        formData.append("cubierta", cubierta);
        formData.append("ubicacion", ubicacion);
        formData.append("tipoInversor", tipoInversor);
        formData.append("porcentajeGeneracion", porcentajeGeneracion);

        res = await axios.post(
          "https://cash-48v3.onrender.com/procesar-factura",
          formData
        );
      } else {
        const payload = {
          nombre: manual.nombre || "No disponible",
          direccion: manual.direccion || "No disponible",
          municipio: manual.municipio || "No disponible",
          estrato: manual.estrato || "0",
          tipo_servicio: manual.tipo_servicio || "Residencial",
          consumo_kwh: Number(manual.consumo_kwh || 0),
          valor_kwh: manual.valor_kwh ? Number(manual.valor_kwh) : null,
          estructura,
          cubierta,
          ubicacion,
          tipoInversor,
          porcentajeGeneracion,
        };

        res = await axios.post(
          "https://cash-48v3.onrender.com/procesar-datos",
          payload
        );
      }

      if (!res?.data) throw new Error("El servidor no devolvió resultados");

      setResultado(res.data);

      // ✅ Guardar SIEMPRE (con usuario o anónima)
      await guardarCotizacion(res.data);

    } catch (err) {
      console.error("❌ Error en CotizadorFactura:", err);
      setError(
        "No se pudo procesar la solicitud. Verifica la información e inténtalo nuevamente."
      );
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async () => {
    if (!resultado || generandoPDF) return;
    setGenerandoPDF(true);
    setError(null);
    try {
      await generateQuotePdf({
        resultado,
        configuracion: { estructura, cubierta, ubicacion, tipoInversor, porcentajeGeneracion },
        advisorEmail: auth.currentUser?.email,
      });
    } catch (pdfError) {
      console.error("Error al generar el PDF:", pdfError);
      setError("No fue posible generar el PDF. Inténtalo nuevamente.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="quote-tool">
      <header className="quote-heading">
        <div><span className="section-kicker">04 / Empieza tu proyecto</span><h2>Cotiza tu<br />sistema solar.</h2></div>
        <p>Tu próxima fuente de energía empieza aquí. Comparte tu factura o los datos de tu consumo para obtener una estimación preliminar.</p>
      </header>
      <form onSubmit={handleSubmit} className="quote-form">
        <div className="quote-input-section">
          <div className="quote-step"><span>01</span><h3>Conozcamos tu consumo</h3></div>
          <div className="toggle-cotizador" role="group" aria-label="Modo de cotización">
            <input type="radio" className="btn-check" name="modo" id="btnFactura" autoComplete="off" checked={modo === "factura"} onChange={() => setModo("factura")} />
            <label htmlFor="btnFactura"><i className="bi bi-file-earmark-pdf" aria-hidden="true" /> Subir factura</label>
            <input type="radio" className="btn-check" name="modo" id="btnDatos" autoComplete="off" checked={modo === "datos"} onChange={() => setModo("datos")} />
            <label htmlFor="btnDatos"><i className="bi bi-pencil-square" aria-hidden="true" /> Ingresar datos</label>
          </div>
          {modo === "factura" ? (
            <div className="quote-upload">
              <i className="bi bi-file-earmark-arrow-up" aria-hidden="true" />
              <label htmlFor="quote-file">Tu factura de energía</label>
              <p>Selecciona el documento PDF de tu factura más reciente.</p>
              <input id="quote-file" type="file" accept="application/pdf" onChange={handleFileChange} className="form-control" required aria-describedby="quote-file-hint" />
              <small id="quote-file-hint">Formato PDF · Máximo 5 MB</small>
            </div>
          ) : (
            <div className="quote-fields">
              <div><label className="form-label" htmlFor="quote-name">Nombre</label><input id="quote-name" className="form-control" autoComplete="name" name="nombre" value={manual.nombre} onChange={handleManualChange} /></div>
              <div><label className="form-label" htmlFor="quote-address">Dirección</label><input id="quote-address" className="form-control" autoComplete="street-address" name="direccion" value={manual.direccion} onChange={handleManualChange} /></div>
              <div><label className="form-label" htmlFor="quote-city">Municipio</label><input id="quote-city" className="form-control" name="municipio" value={manual.municipio} onChange={handleManualChange} /></div>
              <div><label className="form-label" htmlFor="quote-service">Tipo de servicio</label><select id="quote-service" className="form-select" name="tipo_servicio" value={manual.tipo_servicio} onChange={handleManualChange} required><option>Residencial</option><option>Comercial</option><option>Industrial</option></select></div>
              {esResidencial && <div><label className="form-label" htmlFor="quote-stratum">Estrato</label><input id="quote-stratum" className="form-control" name="estrato" type="number" min="1" max="6" value={manual.estrato} onChange={handleManualChange} required /></div>}
              <div><label className="form-label" htmlFor="quote-consumption">Consumo mensual (kWh)</label><input id="quote-consumption" className="form-control" name="consumo_kwh" type="number" min="0" step="1" value={manual.consumo_kwh} onChange={handleManualChange} required /></div>
              <div><label className="form-label" htmlFor="quote-rate">Valor kWh (COP)</label><input id="quote-rate" className="form-control" name="valor_kwh" type="number" min="0" step="1" value={manual.valor_kwh} onChange={handleManualChange} /></div>
            </div>
          )}
        </div>
        <div className="quote-config-section">
          <div className="quote-step"><span>02</span><h3>Configuremos tu sistema</h3></div>
          <div className="quote-fields">
            <div><label className="form-label" htmlFor="quote-structure">Estructura</label><select id="quote-structure" className="form-select" value={estructura} onChange={(e) => setEstructura(e.target.value)}><option value="trapezoidal">Trapezoidal</option><option value="madera">Madera</option><option value="cercha">Cercha</option><option value="granja">Granja</option><option value="plancha">Plancha</option><option value="perfil_metalico">Perfil metálico</option></select></div>
            <div><label className="form-label" htmlFor="quote-roof">Cubierta</label><select id="quote-roof" className="form-select" value={cubierta} onChange={(e) => setCubierta(e.target.value)}><option value="fibrocemento">Fibrocemento</option><option value="teja_colonial">Teja colonial</option><option value="trapezoidal">Trapezoidal</option></select></div>
            <div><label className="form-label" htmlFor="quote-location">Ubicación</label><select id="quote-location" className="form-select" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}><option value="risaralda">Risaralda</option><option value="quindio">Quindío</option><option value="valle">Valle</option><option value="caldas">Caldas</option></select></div>
            <div><label className="form-label" htmlFor="quote-system">Tipo de sistema</label><select id="quote-system" className="form-select" value={tipoInversor} onChange={(e) => setTipoInversor(e.target.value)}><option value="ongrid">On Grid</option><option value="hibrido">Híbrido</option></select></div>
          </div>
          <div className="quote-coverage"><label className="form-label" htmlFor="quote-coverage"><span>Cobertura de generación</span><strong>{porcentajeGeneracion}%</strong></label><input id="quote-coverage" type="range" className="form-range" min="50" max="200" step="50" value={porcentajeGeneracion} onChange={(e) => setPorcentajeGeneracion(parseInt(e.target.value, 10))} /><div className="quote-range-labels"><span>50%</span><span>100%</span><span>150%</span><span>200%</span></div></div>
          <button type="submit" className="btn btn-redsolar-primary w-100" disabled={loading}>{loading ? <>Procesando… <span className="spinner-border spinner-border-sm" aria-hidden="true" /></> : <>Calcular mi sistema <i className="bi bi-arrow-up-right" aria-hidden="true" /></>}</button>
          <p className="quote-note">Una estimación inicial. La propuesta definitiva se confirma con la evaluación técnica.</p>
        </div>
      </form>
      {error && <div className="alert alert-danger mt-4" role="alert">{error}</div>}
      {resultado && (
        <section className="quote-results" aria-labelledby="quote-result-title" aria-live="polite">
          <span className="section-kicker">Tu proyecto, en cifras</span><h3 id="quote-result-title">Una primera mirada a tu sistema.</h3>
          <div className="table-responsive"><table className="table align-middle"><thead><tr><th scope="col">Características</th><th scope="col">Estimación</th></tr></thead><tbody>
            <tr><th scope="row">Nombre</th><td>{resultado.nombre}</td></tr><tr><th scope="row">Dirección</th><td>{resultado.direccion}</td></tr><tr><th scope="row">Municipio</th><td>{resultado.municipio}</td></tr><tr><th scope="row">Estrato</th><td>{resultado.estrato}</td></tr><tr><th scope="row">Tipo de servicio</th><td>{resultado.tipo_servicio}</td></tr><tr><th scope="row">Consumo mensual</th><td>{Number(resultado.consumo_kwh).toFixed(0)} kWh</td></tr><tr><th scope="row">Número de paneles</th><td>{resultado.numero_paneles}</td></tr><tr><th scope="row">Inversor</th><td>{resultado.inversor_utilizado}</td></tr><tr className="quote-price"><th scope="row">Inversión estimada</th><td>{resultado.precio_total?.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td></tr><tr><th scope="row">Generación mensual</th><td>{resultado.generacion_mensual_min && resultado.generacion_mensual_max ? `${resultado.generacion_mensual_min.toFixed(0)} – ${resultado.generacion_mensual_max.toFixed(0)} kWh` : "N/D"}</td></tr><tr><th scope="row">Cobertura</th><td>{resultado.porcentaje_generacion ?? porcentajeGeneracion}%</td></tr>
          </tbody></table></div>
          <div className="quote-download"><button type="button" className="btn btn-redsolar-primary" onClick={exportarPDF} disabled={generandoPDF}><i className="bi bi-file-earmark-pdf" aria-hidden="true" />{generandoPDF ? "Preparando propuesta…" : "Descargar propuesta PDF"}</button><p>Resumen, detalle técnico, inversión y próximos pasos en un solo documento.</p></div>
        </section>
      )}
    </div>
  );
};

export default CotizadorFactura;
