import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Simulador.css';


const Simulador = () => {
  const [formData, setFormData] = useState({
    generacion_anual_kwh: 150000,
    porcentaje_autoconsumo: 0.4,
    consumo_anual_usuario: 150000,
    precio_compra_kwh: 577,
    crecimiento_energia: 0.08,
    precio_bolsa: 400,
    crecimiento_bolsa: 0.08,
    componente_comercializacion: 60,
    capex: 320000000,
    opex_anual: 2000000,
    horizonte_anios: 20,
    tasa_descuento: 0.10
  });

  const [resultado, setResultado] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('https://cash-48v3.onrender.com/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setResultado(data);
  };

  useEffect(() => {
    if (resultado && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: resultado.flujos.map((_, i) => `Año ${i}`),
          datasets: [{
            label: 'Flujo de Caja (COP)',
            data: resultado.flujos,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Flujo de Caja Anual del Proyecto'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'COP'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Año'
              }
            }
          }
        }
      });
    }
  }, [resultado]);

  return (
    <div className="simulador-container">
      <h2 className="text-primary fw-bold mb-4">Simulador Financiero FV</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map(key => (
          <div className="mb-3" key={key}>
            <label className="form-label">{key.replace(/_/g, ' ')}</label>
            <input
              type="number"
              step="any"
              name={key}
              className="form-control"
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary w-100">Calcular Flujo</button>
      </form>

      {resultado && (
        <div className="mt-5">
          <h4>Resultado Financiero</h4>
          <p><strong>VPN:</strong> {resultado.vpn.toLocaleString()} COP</p>
          <p><strong>TIR:</strong> {resultado.tir} %</p>
          <p><strong>Ingreso total año 1:</strong> {resultado.ingreso_total.toLocaleString()} COP</p>
          <p><strong>Autoconsumo:</strong> {resultado.autoconsumo_kwh.toLocaleString()} kWh</p>
          <p><strong>Excedente 1:</strong> {resultado.excedente1_kwh.toLocaleString()} kWh</p>
          <p><strong>Excedente 2:</strong> {resultado.excedente2_kwh.toLocaleString()} kWh</p>

          <canvas ref={chartRef} width="600" height="300" className="mt-4" />
        </div>
      )}
    </div>
  );
};

export default Simulador;