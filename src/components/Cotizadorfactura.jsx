// src/components/CotizadorFactura.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CotizadorFactura = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [form, setForm] = useState({
    estructura: 'madera',
    cubierta: 'fibrocemento',
    ubicacion: 'quindio',
    tipoInversor: 'ongrid'
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Por favor carga una factura en PDF.");

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('estructura', form.estructura);
    formData.append('cubierta', form.cubierta);
    formData.append('ubicacion', form.ubicacion);
    formData.append('tipoInversor', form.tipoInversor);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/procesar-factura', formData);
      setResultado(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al procesar la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Cotiza tu sistema solar</h2>

      <form onSubmit={handleSubmit} className="text-center">
        <div className="mb-3">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="form-control" />
        </div>

        <div className="row mb-3">
          <div className="col">
            <label>Estructura</label>
            <select name="estructura" value={form.estructura} onChange={handleChange} className="form-select">
              <option value="madera">Madera</option>
              <option value="perfil_metalico">Perfil metálico</option>
              <option value="cercha">Cercha</option>
              <option value="plancha">Plancha</option>
              <option value="granja">Granja</option>
            </select>
          </div>

          <div className="col">
            <label>Cubierta</label>
            <select name="cubierta" value={form.cubierta} onChange={handleChange} className="form-select">
              <option value="teja_colonial">Teja colonial</option>
              <option value="fibrocemento">Fibrocemento</option>
              <option value="trapezoidal">Trapezoidal</option>
            </select>
          </div>

          <div className="col">
            <label>Ubicación</label>
            <select name="ubicacion" value={form.ubicacion} onChange={handleChange} className="form-select">
              <option value="quindio">Quindío</option>
              <option value="risaralda">Risaralda</option>
              <option value="caldas">Caldas</option>
              <option value="valle">Valle</option>
            </select>
          </div>

          <div className="col">
            <label>Tipo de inversor</label>
            <select name="tipoInversor" value={form.tipoInversor} onChange={handleChange} className="form-select">
              <option value="ongrid">On-grid</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Procesando...' : 'Enviar'}
        </button>
      </form>

      {resultado && (
        <div className="mt-5 text-start">
          <h4>Resultado del análisis:</h4>
          <ul>
            <li><strong>Consumo mensual promedio:</strong> {resultado.consumo_kwh} kWh</li>
            <li><strong>Potencia estimada:</strong> {resultado.potencia_kwp} kWp</li>
            <li><strong>Número de paneles sugerido:</strong> {resultado.numero_paneles}</li>
            <li><strong>Precio estimado:</strong> ${resultado.precio_total.toLocaleString()}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CotizadorFactura;
