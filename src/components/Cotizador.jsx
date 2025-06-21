import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Cotizador.css';

const Cotizador = () => {
  const [formData, setFormData] = useState({
    valor_factura: '',
    tipo_instalacion: 'residencial',
    area_disponible: '',
    tipo_area: 'techo'
  });

  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor_factura' || name === 'area_disponible' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:8000/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setResultado(data);
  };

  return (
    <div className="cotizador-container" data-aos="fade-up">
      <h2 className="text-primary fw-bold mb-4">Cotizador Solar Básico</h2>
      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-delay="100">
        <div className="mb-3">
          <label className="form-label">Valor mensual de la factura (COP)</label>
          <input type="number" name="valor_factura" className="form-control" value={formData.valor_factura} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Tipo de instalación</label>
          <select name="tipo_instalacion" className="form-select" value={formData.tipo_instalacion} onChange={handleChange}>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Área disponible (m²)</label>
          <input type="number" name="area_disponible" className="form-control" value={formData.area_disponible} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Tipo de área</label>
          <select name="tipo_area" className="form-select" value={formData.tipo_area} onChange={handleChange}>
            <option value="techo">Techo</option>
            <option value="suelo">Suelo</option>
            <option value="carport">Carport</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100" data-aos="zoom-in" data-aos-delay="150">Calcular Cotización</button>
      </form>

      {resultado && (
        <div className="mt-5 bg-light p-4 rounded shadow-sm" data-aos="fade-up" data-aos-delay="200">
          <h4>Resultado</h4>
          <p><strong>Consumo estimado anual:</strong> {resultado.consumo_estimado_kwh} kWh</p>
          <p><strong>Potencia estimada:</strong> {resultado.potencia_estim_kwp} kWp</p>
          <p><strong>CAPEX estimado:</strong> {resultado.capex_estimado.toLocaleString()} COP</p>
          <p><strong>Área requerida:</strong> {resultado.area_requerida} m²</p>
          {resultado.advertencia && (
            <p className="text-danger"><strong>⚠️ {resultado.advertencia}</strong></p>
          )}
        </div>
      )}
    </div>
  );
};

export default Cotizador;