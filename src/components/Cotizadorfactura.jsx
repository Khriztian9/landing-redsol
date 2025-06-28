import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CotizadorFactura.css";


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
      setResultado(res.data);
      setError(null);
    } catch (err) {
      setError("No se pudo procesar la factura. Verifica el archivo y vuelve a intentar.");
      setResultado(null);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center text-primary" data-aos="fade-down">
        Cotizador Solar desde Factura
      </h2>

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

            <button type="submit" className="btn custom-cotizador-btn w-100">Calcular</button>
      </form>

      {error && <div className="alert alert-danger" data-aos="fade-right">{error}</div>}

      {resultado && (
        <div className="row">
          <div className="col-md-6" data-aos="fade-right">
            <div className="card shadow p-3 mb-4 border-primary bg-white">
              <h5 className="card-title text-primary mb-3">📋 Datos del Cliente</h5>
              <ul className="list-unstyled">
                <li><strong>👤 Nombre:</strong> {resultado.nombre || 'No disponible'}</li>
                <li><strong>🏠 Dirección:</strong> {resultado.direccion || 'No disponible'}</li>
                <li><strong>🏘️ Municipio:</strong> {resultado.municipio || 'No disponible'}</li>
                <li><strong>📶 Tipo de servicio:</strong> {resultado.tipo_servicio || 'No disponible'}</li>
                <li><strong>⚡ Consumo anual:</strong> {resultado.consumo_kwh*12?.toFixed(0)} kWh</li>
                <li><strong>📈 Precio por kWh:</strong> {resultado.valor_kwh ? resultado.valor_kwh.toFixed(0) + " COP" : "No disponible"}</li>
              </ul>
            </div>
          </div>

          <div className="col-md-6" data-aos="fade-left">
            <div className="card shadow p-3 mb-4 border-success bg-light">
              <h5 className="card-title text-primary mb-3">📊 Resultados Técnicos</h5>
              <ul className="list-unstyled">
                <li><strong>💸 Costo energía anual:</strong> $ {resultado.costo_energia?.toLocaleString("es-CO") || "No aplica"}</li>
                <li><strong>🔋 Potencia requerida:</strong> {resultado.potencia_kwp?.toFixed(2)} kWp</li>
                <li><strong>⚙️ Inversor propuesto:</strong> {resultado.inversor_utilizado || "No disponible"}</li>
                <li><strong>🔧 Número de paneles:</strong> {resultado.numero_paneles}</li>
                <li><strong>💰 Precio estimado proyecto:</strong> $ {resultado.precio_total.toLocaleString("es-CO")}</li>
                <li><strong>🔆 Generación anual estimada:</strong> {resultado.generacion_mensual_min*12?.toFixed(0).toLocaleString("es-CO")} – {resultado.generacion_mensual_max*12?.toFixed(0).toLocaleString("es-CO")} kWh</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizadorFactura;
