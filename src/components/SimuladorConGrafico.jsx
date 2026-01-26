import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import './Simulador.css';

Chart.register(annotationPlugin);

// 👉 Formatear COP
const formatCOP = (value) => {
  if (typeof value !== "number") return value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(value);
};

const Simulador = () => {
  const [formData, setFormData] = useState({
    generacion_anual_kwh: 7500,
    porcentaje_autoconsumo: 0.2,
    consumo_anual_usuario: 6000,
    precio_compra_kwh: 950,
    crecimiento_energia: 0.08,
    precio_bolsa: 400,
    crecimiento_bolsa: 0.08,
    componente_comercializacion: 60,
    capex: 22000000,
    opex_anual: 1000000,
    horizonte_anios: 25,
    tasa_descuento: 0.10,
    anios_deduccion_renta: 3,
    anios_leasing: 10,
    tasa_leasing: 0.08
  });

  const [resultado, setResultado] = useState(null);
  const [verConBeneficios, setVerConBeneficios] = useState(false);
  const [verLeasing, setVerLeasing] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const handleChange = (e) => {
    const value =
      e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('https://cash-48v3.onrender.com/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setResultado(data);
    setVerConBeneficios(false);
    setVerLeasing(false);
  };

  // 🔹 Selecciona flujos según escenario
  const getFlujos = () => {
    if (!resultado) return [];
    if (verLeasing && verConBeneficios) return resultado.flujos_leasing_con_bt;
    if (verLeasing) return resultado.flujos_leasing_sin_bt;
    if (verConBeneficios) return resultado.flujos_con_bt;
    return resultado.flujos_sin_bt;
  };

  // ✅ Año donde el flujo ACUMULADO cruza de <=0 a >0
  const getAnioCrucePositivo = (flujos) => {
    if (!Array.isArray(flujos) || flujos.length === 0) return null;

    let acumulado = 0;
    let prev = 0;

    for (let i = 0; i < flujos.length; i++) {
      acumulado += Number(flujos[i]) || 0;

      if (prev <= 0 && acumulado > 0) return i;

      prev = acumulado;
    }
    return null;
  };

  // 🔹 Construye tabla dinámica con columnas condicionales
  const getTablaDinamica = () => {
    if (!resultado) return [];

    const flujos = getFlujos();
    let acumulado = 0;

    return resultado.tabla_resultados.map((row, i) => {
      const flujo = flujos[i] ?? row['Flujo Neto'];
      acumulado += flujo;

      let fila = {
        'Año': row['Año'],
        'Generación (kWh)': row['Generación (kWh)'],
        'Tarifa Energía (COP/kWh)': row['Tarifa Energía (COP/kWh)'],
        'Ingreso Autoconsumo': row['Ingreso Autoconsumo'],
        'Ingreso Excedente1': row['Ingreso Excedente1'],
        'Ingreso Excedente2': row['Ingreso Excedente2'],
        'OPEX': row['OPEX'],
      };

      // Leasing justo después de OPEX
      if (verLeasing) {
        fila['Costo Leasing'] = row['Costo Leasing'];
      }

      fila['Flujo Base'] = row['Flujo Base'];

      // Beneficios después de Flujo Base
      if (verConBeneficios) {
        fila['Beneficio Depreciación'] = row['Beneficio Depreciación'];
        fila['Beneficio Renta'] = row['Beneficio Renta'];
      }

      fila['Flujo Neto'] = flujo;
      fila['Flujo Acumulado'] = acumulado;

      return fila;
    });
  };

  useEffect(() => {
    if (resultado && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      const colorMap = {
        base: { label: '', border: 'blue', bg: 'rgba(0,123,255,0.1)' },
        beneficios: {
          label: 'con beneficios tributarios',
          border: 'green',
          bg: 'rgba(40,167,69,0.1)',
        },
        leasing: { label: 'Leasing ', border: 'orange', bg: 'rgba(255,165,0,0.1)' },
        ambos: {
          label: 'Leasing + Beneficios',
          border: 'purple',
          bg: 'rgba(128,0,128,0.1)',
        },
      };

      let flujos, style;
      if (verLeasing && verConBeneficios) {
        flujos = resultado.flujos_leasing_con_bt;
        style = colorMap.ambos;
      } else if (verLeasing) {
        flujos = resultado.flujos_leasing_sin_bt;
        style = colorMap.leasing;
      } else if (verConBeneficios) {
        flujos = resultado.flujos_con_bt;
        style = colorMap.beneficios;
      } else {
        flujos = resultado.flujos_sin_bt;
        style = colorMap.base;
      }

      // ✅ índice del año donde el acumulado cruza a positivo
      const anioCruce = getAnioCrucePositivo(flujos);

      // ✅ Labels tipo category para que annotation funcione perfecto con xMin/xMax
      const labels = flujos.map((_, i) => `Año ${i}`);
      const labelCruce = anioCruce !== null ? labels[anioCruce] : null;

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: style.label,
              data: flujos,
              borderColor: style.border,
              backgroundColor: style.bg,
              fill: true,
              tension: 0.4,
              cubicInterpolationMode: 'monotone',
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Flujo de Caja Anual del Proyecto' },

            // ✅ Línea vertical VERDE donde el acumulado pasa a positivo
            annotation: labelCruce
              ? {
                  annotations: {
                    crucePositivo: {
                      type: 'line',
                      xScaleID: 'x',     // 👈 IMPORTANTE
                      xMin: labelCruce,  // 👈 usar label exacto
                      xMax: labelCruce,
                      borderColor: 'green',
                      borderWidth: 3,
                      borderDash: [6, 6],
                      label: {
                        display: true,
                        content: ``,
                        position: 'start',
                        color: 'green',
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        padding: 4,
                      },
                    },
                  },
                }
              : undefined,
          },
          scales: {
            y: {
              title: { display: true, text: 'COP' },
              ticks: { callback: (value) => formatCOP(value) },
            },
            x: {
              title: { display: true, text: 'Año' },
              ticks: { callback: (value) => value }, // ya viene "Año N"
            },
          },
        },
      });
    }
  }, [resultado, verConBeneficios, verLeasing]);

  // ====== Exportar PDF ======
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Cabecera
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 60, 120);
    doc.text('Informe Financiero Proyecto FV', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Generado automáticamente - ' + new Date().toLocaleDateString('es-CO'), 14, 22);

    // ====== GRÁFICO EN PDF (alta calidad) ======
    const canvas = chartRef.current;
    if (canvas) {
      const scale = 3;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width * scale;
      tmpCanvas.height = canvas.height * scale;

      const tmpCtx = tmpCanvas.getContext('2d');
      tmpCtx.scale(scale, scale);
      tmpCtx.drawImage(canvas, 0, 0);

      const imgData = tmpCanvas.toDataURL('image/png', 1.0);
      const imgProps = doc.getImageProperties(imgData);

      const pdfWidth = doc.internal.pageSize.getWidth() - 30;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.setFontSize(14);
      doc.setTextColor(40, 60, 120);
      doc.text('Evolución del Flujo de Caja Anual', 14, 35);

      doc.addImage(imgData, 'PNG', 15, 40, pdfWidth, pdfHeight, '', 'FAST');
    }

    // ====== TABLA DETALLADA ======
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(40, 60, 120);
    doc.text('Resultados Detallados por Año', 14, 20);

    const tabla = getTablaDinamica();
    autoTable(doc, {
      startY: 25,
      head: [Object.keys(tabla[0] || {})],
      body: tabla.map((row) =>
        Object.entries(row).map(([col, val]) =>
          typeof val === 'number' && col !== 'Año' && col !== 'Generación (kWh)'
            ? formatCOP(val)
            : val
        )
      ),
      theme: 'striped',
      headStyles: {
        fillColor: [40, 60, 120],
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // ====== FOOTER ======
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, 260, 200);
      doc.text('© 2025 RED SOL Colombia', 14, 200);
    }

    doc.save('Informe_FV.pdf');
  };

  // ====== Exportar CSV ======
  const exportCSV = () => {
    const tabla = getTablaDinamica();
    const rows = [Object.keys(tabla[0] || {})];

    tabla.forEach((r) =>
      rows.push(
        Object.entries(r).map(([col, val]) =>
          typeof val === 'number' && col !== 'Año' && col !== 'Generación (kWh)'
            ? formatCOP(val)
            : val
        )
      )
    );

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'resultado_fv.csv');
  };

  return (
    <div className="simulador-container">
      <h2>SIMULADOR FINANCIERO FV</h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {Object.keys(formData).map((key) => (
            <div className="col-md-6 mb-3" key={key}>
              <label className="form-label">{key.replace(/_/g, ' ').replace(/anios/g, 'años')}</label>
              <input
                type="number"
                step="any"
                name={key}
                className="form-control"
                value={formData[key]}
                onChange={handleChange}
                min={key.includes('anios') ? 1 : undefined}
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Calcular Flujo
        </button>
      </form>

      {resultado && (
        <>
          {/* Filtros */}
          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="verConBeneficios"
              checked={verConBeneficios}
              onChange={() => setVerConBeneficios(!verConBeneficios)}
            />
            <label className="form-check-label" htmlFor="verConBeneficios">
              Ver resultados con beneficios tributarios
            </label>
          </div>

          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="verLeasing"
              checked={verLeasing}
              onChange={() => setVerLeasing(!verLeasing)}
            />
            <label className="form-check-label" htmlFor="verLeasing">
              Ver resultados con leasing
            </label>
          </div>
        </>
      )}

      {resultado && (
        <div className="mt-4">
          <canvas ref={chartRef} width="600" height="300" />

          <h5 className="mt-4 fw-bold">📊 Resultados Detallados (Escenario Actual)</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-sm mt-2">
              <thead className="table-light">
                <tr>
                  {Object.keys(getTablaDinamica()[0] || {}).map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getTablaDinamica().map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([col, val], j) => (
                      <td
                        key={j}
                        className={col.includes('Beneficio') ? 'beneficio' : col.includes('Leasing') ? 'leasing' : ''}
                      >
                        {typeof val === 'number' && col !== 'Año' && col !== 'Generación (kWh)'
                          ? formatCOP(val)
                          : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={exportPDF} className="btn btn-danger me-2">
            Exportar PDF
          </button>
          <button onClick={exportCSV} className="btn btn-success">
            Exportar CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default Simulador;
