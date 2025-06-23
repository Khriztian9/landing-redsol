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
    if (formData.valor_factura <= 0 || formData.area_disponible <= 0) {
      alert("Por favor ingresa valores positivos.");
      return;
    }
    const res = await fetch('https://cash-48v3.onrender.com/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setResultado(data);
  };

  return (
    <div className="cotizador-wrapper container my-5" data-aos="fade-up">
      <div className="row shadow-lg rounded p-4 bg-white align-items-center">
        
        {/* Formulario */}
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Factura mensual (COP)</label>
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
            <button type="submit" className="btn btn-success w-100">Calcular Cotización</button>
          </form>
        </div>

        {/* Imagen + Resultado */}
        <div className="col-md-6 text-center">
          
          {resultado && (
            <div className="p-3 bg-light rounded border">
              <p><strong>Consumo anual:</strong> {resultado.consumo_estimado_kwh.toLocaleString()} kWh</p>
              <p><strong>Potencia estimada:</strong> {resultado.potencia_estim_kwp.toLocaleString()} kWp</p>
              <p><strong>CAPEX:</strong> {resultado.capex_estimado.toLocaleString()} COP</p>
              <p><strong>Área requerida:</strong> {resultado.area_requerida.toLocaleString()} m²</p>
              {resultado.advertencia && (
                <p className="text-danger"><strong>⚠️ {resultado.advertencia}</strong></p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cotizador;
