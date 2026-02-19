// Simulador.jsx (código completo)
// - Muestra "Qué es" / "Cómo funciona" SOLO cuando el campo está enfocado.
// - Texto con contraste (negro/gris) y acentos azules.
// - Mantiene tu lógica: API, escenarios, chart, tabla, PDF y CSV.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import './Simulador.css';

Chart.register(annotationPlugin);

const formatCOP = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const DEFAULTS = {
  generacion_anual_kwh: 36000,
  porcentaje_autoconsumo: 0.25,
  consumo_anual_usuario: 30000,
  precio_compra_kwh: 830,
  crecimiento_energia: 0.08,
  precio_bolsa: 400,
  crecimiento_bolsa: 0.08,
  componente_comercializacion: 100,
  capex: 83000000,
  opex_anual: 2000000,
  horizonte_anios: 25,
  tasa_descuento: 0.10,
  anios_deduccion_renta: 3,
  anios_leasing: 10,
  tasa_leasing: 0.08
};

const InfoTip = ({ text }) => (
  <span className="rs-tip" title={text} aria-label={text}>ⓘ</span>
);

const MetricCard = ({ title, value, sub }) => (
  <div className="rs-metric">
    <div className="rs-metric-title">{title}</div>
    <div className="rs-metric-value">{value}</div>
    {sub && <div className="rs-metric-sub">{sub}</div>}
  </div>
);

const Badge = ({ tone = "neutral", children }) => (
  <span className={`rs-badge rs-badge-${tone}`}>{children}</span>
);

const Simulador = () => {
  const [formData, setFormData] = useState(DEFAULTS);
  const [resultado, setResultado] = useState(null);

  const [verConBeneficios, setVerConBeneficios] = useState(false);
  const [verLeasing, setVerLeasing] = useState(false);

  const [focusedKey, setFocusedKey] = useState(null); // ✅ campo enfocado
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // === Percent fields: UI 0–100, backend 0–1 ===
  const isPercentField = (key) =>
    ["porcentaje_autoconsumo", "crecimiento_energia", "crecimiento_bolsa", "tasa_descuento", "tasa_leasing"].includes(key);

  const getUiValue = (key, value) => (isPercentField(key) ? (Number(value) || 0) * 100 : (Number(value) || 0));
  const setUiValue = (key, uiValue) => {
    const n = Number(uiValue);
    const safe = Number.isFinite(n) ? n : 0;
    return isPercentField(key) ? safe / 100 : safe;
  };

  const updateField = (key, uiValue, { min, max } = {}) => {
    const n = Number(uiValue);
    const safe = Number.isFinite(n) ? n : 0;
    const limited = (min !== undefined && max !== undefined) ? clamp(safe, min, max) : safe;
    setFormData((prev) => ({ ...prev, [key]: setUiValue(key, limited) }));
  };

  // ====== Secciones y campos (con desc/how) ======
  const sections = useMemo(() => ([
    {
      title: "Energía",
      desc: "Datos de producción/consumo y autoconsumo.",
      items: [
        {
          key: "generacion_anual_kwh",
          label: "Generación anual estimada",
          desc: "Energía total que producirá el sistema en un año.",
          how: "Se usa para calcular autoconsumo y excedentes. En el modelo, la generación se degrada 0,5% por año.",
          tip: "Dato típico del diseño (PVGIS/Helioscope) o estimación por kWp.",
          unit: "kWh/año",
          type: "number",
          min: 0, max: 2000000, step: 50,
          highlight: true,
          hint: (raw) => `≈ ${formatNumber((Number(raw) || 0) / 12)} kWh/mes`
        },
        {
          key: "consumo_anual_usuario",
          label: "Consumo anual del usuario",
          desc: "Consumo total del cliente en un año.",
          how: "Define cuánto excedente puede cruzarse contra consumo (Excedente 1) y cuánto va a bolsa (Excedente 2).",
          tip: "Saca el promedio de las últimas facturas.",
          unit: "kWh/año",
          type: "number",
          min: 0, max: 2000000, step: 50,
          hint: (raw) => `≈ ${formatNumber((Number(raw) || 0) / 12)} kWh/mes`
        },
        {
          key: "porcentaje_autoconsumo",
          label: "Autoconsumo",
          desc: "Porcentaje de la generación que el cliente consume directamente (sin inyectar).",
          how: "A mayor autoconsumo, mayor ahorro (reemplazas energía comprada). El resto se considera excedente.",
          tip: "En comercio suele ser más alto; en residencial depende de consumo diurno.",
          unit: "%",
          ui: "percent",
          min: 0, max: 100, step: 1,
          slider: true,
          quick: [20, 35, 50, 65, 75],
          hint: (_raw, uiValue, all) => {
            const gen = Number(all.generacion_anual_kwh) || 0;
            const kwh = gen * (uiValue / 100);
            return `Autoconsumo estimado: ${formatNumber(kwh)} kWh/año`;
          }
        }
      ]
    },
    {
      title: "Tarifas y mercado",
      desc: "Tarifa de compra, bolsa, crecimientos y comercialización.",
      items: [
        {
          key: "precio_compra_kwh",
          label: "Tarifa de compra",
          desc: "Precio promedio que paga el cliente por cada kWh consumido.",
          how: "Se multiplica por el autoconsumo para estimar el ahorro anual. Crece cada año según el crecimiento de tarifa.",
          tip: "Tómalo como promedio de facturas (energía + cargos).",
          unit: "COP/kWh",
          type: "currencyPerKwh",
          min: 0, max: 3000, step: 10,
          highlight: true
        },
        {
          key: "crecimiento_energia",
          label: "Crecimiento tarifa",
          desc: "Porcentaje anual esperado de aumento de la tarifa.",
          how: "Aumenta el valor del ahorro por autoconsumo y el cruce de excedentes con tarifa.",
          tip: "Ej: 8% → ingresar 8.",
          unit: "%/año",
          ui: "percent",
          min: 0, max: 30, step: 0.5,
          slider: true,
          quick: [5, 8, 10, 12, 15]
        },
        {
          key: "precio_bolsa",
          label: "Precio bolsa (excedentes)",
          desc: "Precio al que se liquidan excedentes que no alcanzan a cruzarse contra consumo.",
          how: "Se aplica al Excedente 2 (lo que sobra después de Excedente 1).",
          tip: "Depende del mercado/OR.",
          unit: "COP/kWh",
          type: "currencyPerKwh",
          min: 0, max: 3000, step: 10
        },
        {
          key: "crecimiento_bolsa",
          label: "Crecimiento bolsa",
          desc: "Porcentaje anual esperado de aumento del precio bolsa.",
          how: "Aumenta el ingreso de excedentes tipo 2 a lo largo del tiempo.",
          tip: "Ej: 8% → ingresar 8.",
          unit: "%/año",
          ui: "percent",
          min: 0, max: 30, step: 0.5,
          slider: true,
          quick: [5, 8, 10, 12]
        },
        {
          key: "componente_comercializacion",
          label: "Componente comercialización",
          desc: "Descuento aplicado al excedente que cruza con tarifa (Excedente 1).",
          how: "En el modelo: Excedente 1 = kWh × (Tarifa - Comercialización).",
          tip: "Ajuste regulatorio/operativo según tu criterio.",
          unit: "COP/kWh",
          type: "currencyPerKwh",
          min: 0, max: 500, step: 5
        }
      ]
    },
    {
      title: "Costos del proyecto",
      desc: "Inversión inicial y costos anuales.",
      items: [
        {
          key: "capex",
          label: "CAPEX (inversión inicial)",
          desc: "Inversión total al inicio del proyecto.",
          how: "Se registra como flujo negativo en el año 0 y afecta VPN/TIR/Payback.",
          tip: "Incluye equipos + instalación + ingeniería + trámites.",
          unit: "COP",
          type: "currency",
          min: 0, max: 100000000000, step: 50000,
          highlight: true
        },
        {
          key: "opex_anual",
          label: "OPEX anual",
          desc: "Costo anual de operación y mantenimiento.",
          how: "Se resta cada año del ingreso total. En el modelo, crece 3% anual.",
          tip: "Incluye lavados, revisiones, monitoreo, seguros, etc.",
          unit: "COP/año",
          type: "currency",
          min: 0, max: 5000000000, step: 20000
        }
      ]
    },
    {
      title: "Horizonte y descuento",
      desc: "Configuración financiera del análisis.",
      items: [
        {
          key: "horizonte_anios",
          label: "Horizonte de evaluación",
          desc: "Número de años para evaluar el proyecto.",
          how: "Determina cuántos años de flujos se calculan y se incluyen en VPN/TIR.",
          tip: "Común: 20–25 años.",
          unit: "años",
          type: "number",
          min: 1, max: 35, step: 1,
          slider: true,
          quick: [15, 20, 25, 30]
        },
        {
          key: "tasa_descuento",
          label: "Tasa de descuento",
          desc: "Tasa para traer flujos futuros a valor presente.",
          how: "Entre más alta, más exigente es el análisis: baja el VPN (en general).",
          tip: "Ej: 10% → ingresar 10.",
          unit: "%/año",
          ui: "percent",
          min: 0, max: 30, step: 0.5,
          slider: true,
          quick: [8, 10, 12, 15]
        }
      ]
    },
    {
      title: "Leasing y beneficios tributarios",
      desc: "Opcional: parámetros de leasing y deducción.",
      items: [
        {
          key: "anios_deduccion_renta",
          label: "Años deducción renta",
          desc: "Años durante los cuales se aplica la deducción de renta.",
          how: "En el modelo se reparte una deducción total en partes iguales por estos años (máx 15).",
          tip: "Si no aplica, usa 0.",
          unit: "años",
          type: "number",
          min: 0, max: 15, step: 1,
          quick: [0, 3, 5, 10, 15]
        },
        {
          key: "anios_leasing",
          label: "Plazo leasing",
          desc: "Duración del leasing para financiar el CAPEX.",
          how: "Durante estos años se resta la cuota anual de leasing del flujo base.",
          tip: "Si no aplica, usa 0.",
          unit: "años",
          type: "number",
          min: 0, max: 20, step: 1,
          quick: [0, 5, 10, 12]
        },
        {
          key: "tasa_leasing",
          label: "Tasa leasing",
          desc: "Tasa anual del leasing.",
          how: "Se usa para calcular la cuota anual: CAPEX × [i / (1 - (1+i)^-n)].",
          tip: "Ej: 8% → ingresar 8.",
          unit: "%/año",
          ui: "percent",
          min: 0, max: 30, step: 0.5,
          slider: true,
          quick: [6, 8, 10, 12]
        }
      ]
    }
  ]), []);

  // ====== Warnings suaves ======
  const warnings = useMemo(() => {
    const w = [];
    const gen = Number(formData.generacion_anual_kwh) || 0;
    const con = Number(formData.consumo_anual_usuario) || 0;
    const autoPctUi = (Number(formData.porcentaje_autoconsumo) || 0) * 100;

    const tarifa = Number(formData.precio_compra_kwh) || 0;
    const bolsa = Number(formData.precio_bolsa) || 0;
    const capex = Number(formData.capex) || 0;
    const opex = Number(formData.opex_anual) || 0;

    if (gen === 0) w.push({ tone: "warning", text: "La generación está en 0. ¿Seguro que el sistema produce energía?" });
    if (con === 0) w.push({ tone: "warning", text: "El consumo anual está en 0. Si es un cliente real, revisa facturas." });

    if (autoPctUi < 5) w.push({ tone: "neutral", text: "Autoconsumo muy bajo (<5%). Usualmente sube si hay consumo diurno." });
    if (autoPctUi > 90) w.push({ tone: "neutral", text: "Autoconsumo muy alto (>90%). Solo si casi todo coincide con horas solares." });

    if (tarifa > 2000) w.push({ tone: "warning", text: "Tarifa > 2.000 COP/kWh: revisa que sea promedio real y no un pico." });
    if (bolsa > tarifa && bolsa > 0) w.push({ tone: "warning", text: "Precio bolsa mayor que la tarifa. Usualmente bolsa es menor." });

    if (capex > 0 && opex > capex * 0.2) w.push({ tone: "warning", text: "OPEX anual parece alto vs CAPEX (más del 20%)." });

    if (gen > 0 && con > 0 && gen > con * 1.5) w.push({ tone: "neutral", text: "Generación mucho mayor que consumo: podrías depender demasiado de excedentes." });

    return w.slice(0, 5);
  }, [formData]);

  // ====== Submit ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if ((Number(formData.horizonte_anios) || 0) < 1) throw new Error("El horizonte debe ser mínimo 1 año.");

      const res = await fetch('https://cash-48v3.onrender.com/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error en el cálculo (${res.status}). ${t?.slice(0, 200) || ''}`);
      }

      const data = await res.json();
      setResultado(data);
      setVerConBeneficios(false);
      setVerLeasing(false);
    } catch (err) {
      setResultado(null);
      setErrorMsg(err?.message || 'Ocurrió un error calculando el flujo.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Selecciona flujos según escenario
  const getFlujos = () => {
    if (!resultado) return [];
    if (verLeasing && verConBeneficios) return resultado.flujos_leasing_con_bt;
    if (verLeasing) return resultado.flujos_leasing_sin_bt;
    if (verConBeneficios) return resultado.flujos_con_bt;
    return resultado.flujos_sin_bt;
  };

  // ✅ Año donde el acumulado cruza de <=0 a >0
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

      if (verLeasing) fila['Costo Leasing'] = row['Costo Leasing'];
      fila['Flujo Base'] = row['Flujo Base'];

      if (verConBeneficios) {
        fila['Beneficio Depreciación'] = row['Beneficio Depreciación'];
        fila['Beneficio Renta'] = row['Beneficio Renta'];
      }

      fila['Flujo Neto'] = flujo;
      fila['Flujo Acumulado'] = acumulado;

      return fila;
    });
  };

  // ====== Chart ======
  useEffect(() => {
    if (resultado && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();

      const ctx = chartRef.current.getContext('2d');

      const colorMap = {
        base: { label: 'Sin beneficios / sin leasing', border: 'blue', bg: 'rgba(0,123,255,0.1)' },
        beneficios: { label: 'Con beneficios', border: 'green', bg: 'rgba(40,167,69,0.1)' },
        leasing: { label: 'Con leasing', border: 'orange', bg: 'rgba(255,165,0,0.1)' },
        ambos: { label: 'Leasing + beneficios', border: 'purple', bg: 'rgba(128,0,128,0.1)' },
      };

      let flujos, style;
      if (verLeasing && verConBeneficios) { flujos = resultado.flujos_leasing_con_bt; style = colorMap.ambos; }
      else if (verLeasing) { flujos = resultado.flujos_leasing_sin_bt; style = colorMap.leasing; }
      else if (verConBeneficios) { flujos = resultado.flujos_con_bt; style = colorMap.beneficios; }
      else { flujos = resultado.flujos_sin_bt; style = colorMap.base; }

      const anioCruce = getAnioCrucePositivo(flujos);
      const labels = flujos.map((_, i) => `Año ${i}`);
      const labelCruce = anioCruce !== null ? labels[anioCruce] : null;

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: style.label,
            data: flujos,
            borderColor: style.border,
            backgroundColor: style.bg,
            fill: true,
            tension: 0.4,
            cubicInterpolationMode: 'monotone',
            pointRadius: 3,
            pointHoverRadius: 5,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Flujo de Caja Anual del Proyecto' },
            annotation: labelCruce ? {
              annotations: {
                crucePositivo: {
                  type: 'line',
                  xScaleID: 'x',
                  xMin: labelCruce,
                  xMax: labelCruce,
                  borderColor: 'green',
                  borderWidth: 3,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: '',
                    position: 'start',
                    color: 'green',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    padding: 4,
                  },
                },
              },
            } : undefined,
          },
          scales: {
            y: { title: { display: true, text: 'COP' }, ticks: { callback: (v) => formatCOP(v) } },
            x: { title: { display: true, text: 'Año' }, ticks: { callback: (v) => v } },
          },
        },
      });
    }
  }, [resultado, verConBeneficios, verLeasing]);

  // ====== Exportar PDF ======
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 60, 120);
    doc.text('Informe Financiero Proyecto FV', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Generado automáticamente - ' + new Date().toLocaleDateString('es-CO'), 14, 22);

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
      headStyles: { fillColor: [40, 60, 120], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

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

  // ====== Métricas desde backend según escenario ======
  const getIndicadoresEscenario = () => {
    if (!resultado) return null;
    if (verLeasing && verConBeneficios) return resultado.leasing_con_bt;
    if (verLeasing) return resultado.leasing_sin_bt;
    if (verConBeneficios) return resultado.con_bt;
    return resultado.sin_bt;
  };

  const indicadores = getIndicadoresEscenario();

  // ====== Render Field (con foco) ======
  const renderField = (field) => {
    const raw = formData[field.key];
    const uiValue = field.ui === 'percent' ? getUiValue(field.key, raw) : (Number(raw) || 0);

    const prefix = (field.type === 'currency' || field.type === 'currencyPerKwh') ? 'COP' : '';
    const suffix = field.ui === 'percent' ? '%' : '';

    const pretty =
      field.type === 'currency' ? formatCOP(Number(raw) || 0)
      : field.type === 'currencyPerKwh' ? `${formatCOP(Number(raw) || 0)} / kWh`
      : field.ui === 'percent' ? `${formatNumber(uiValue)}%`
      : `${formatNumber(Number(raw) || 0)} ${field.unit || ''}`.trim();

    const hint = typeof field.hint === 'function'
      ? field.hint(raw, uiValue, formData)
      : null;

    const showExplain = focusedKey === field.key;

    return (
      <div className={`rs-field ${field.highlight ? 'rs-field-highlight' : ''}`} key={field.key}>
        <div className="rs-field-head">
          <div className="rs-label-wrap">
            <label className="rs-label" htmlFor={field.key}>{field.label}</label>
            {field.tip && <InfoTip text={field.tip} />}
            {field.unit && <span className="rs-unit-chip">{field.unit}</span>}
          </div>
          <div className="rs-preview">{pretty}</div>
        </div>

        {/* ✅ Explicación SOLO en foco */}
        <div className={`rs-explain ${showExplain ? 'show' : ''}`}>
          {field.desc && (
            <div className="rs-desc">
              <span className="rs-desc-label">Qué es:</span> {field.desc}
            </div>
          )}
          {field.how && (
            <div className="rs-how">
              <span className="rs-desc-label">Cómo funciona:</span> {field.how}
            </div>
          )}
        </div>

        {hint && <div className="rs-hint">{hint}</div>}

        <div className="rs-input-row">
          <div className="rs-input-wrap">
            <input
              id={field.key}
              type="number"
              className="form-control rs-input"
              value={uiValue}
              min={field.min}
              max={field.max}
              step={field.step ?? 'any'}
              onFocus={() => setFocusedKey(field.key)}
              onBlur={() => setFocusedKey(null)}
              onChange={(e) => updateField(field.key, e.target.value, { min: field.min, max: field.max })}
              required
            />
            {suffix && <span className="rs-input-suffix">{suffix}</span>}
            {prefix && <span className="rs-input-prefix">{prefix}</span>}
          </div>

          {field.slider && (
            <input
              type="range"
              className="form-range rs-range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={uiValue}
              onFocus={() => setFocusedKey(field.key)}
              onBlur={() => setFocusedKey(null)}
              onChange={(e) => updateField(field.key, e.target.value, { min: field.min, max: field.max })}
            />
          )}
        </div>

        {Array.isArray(field.quick) && field.quick.length > 0 && (
          <div className="rs-chips">
            {field.quick.map((q) => (
              <button
                type="button"
                key={q}
                className="rs-chip"
                onMouseEnter={() => setFocusedKey(field.key)}
                onMouseLeave={() => setFocusedKey(null)}
                onClick={() => updateField(field.key, q, { min: field.min, max: field.max })}
                title="Aplicar sugerido"
              >
                {field.ui === 'percent' ? `${q}%` : q}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const resetForm = () => {
    setFormData(DEFAULTS);
    setResultado(null);
    setVerConBeneficios(false);
    setVerLeasing(false);
    setErrorMsg('');
    setFocusedKey(null);
  };

  return (
    <div className="simulador-container rs-shell">
      <div className="rs-header">
        <div>
          <h2 className="rs-title">Simulador Financiero FV</h2>
          <p className="rs-subtitle">Explicaciones claras por campo (aparecen al enfocarlo) + métricas (VPN/TIR/Payback).</p>
        </div>

        <div className="rs-header-actions">
          <button type="button" className="btn btn-outline-danger rs-btn" onClick={resetForm}>
            Restablecer
          </button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rs-warnings">
          {warnings.map((w, i) => (
            <Badge key={i} tone={w.tone}>{w.text}</Badge>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rs-form">
        {sections.map((sec) => (
          <div className="rs-card" key={sec.title}>
            <div className="rs-card-title">
              <div>
                {sec.title}
                {sec.desc && <div className="rs-card-subtitle">{sec.desc}</div>}
              </div>
            </div>

            <div className="rs-grid">
              {sec.items.map(renderField)}
            </div>
          </div>
        ))}

        {errorMsg && (
          <div className="alert alert-danger mt-3" role="alert">
            {errorMsg}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100 rs-submit" disabled={loading}>
          {loading ? 'Calculando…' : 'Calcular flujo'}
        </button>
      </form>

      {resultado && (
        <>
          <div className="rs-card rs-card-compact mt-3">
            <div className="rs-card-title">Escenario y métricas</div>

            <div className="rs-toggles">
              <label className="rs-toggle">
                <input
                  type="checkbox"
                  checked={verConBeneficios}
                  onChange={() => setVerConBeneficios(!verConBeneficios)}
                />
                <span>Con beneficios tributarios</span>
              </label>

              <label className="rs-toggle">
                <input
                  type="checkbox"
                  checked={verLeasing}
                  onChange={() => setVerLeasing(!verLeasing)}
                />
                <span>Con leasing</span>
              </label>
            </div>

            <div className="rs-metrics">
              <MetricCard
                title="VPN"
                value={indicadores?.vpn !== null && indicadores?.vpn !== undefined ? formatCOP(indicadores.vpn) : '—'}
                sub="Valor Presente Neto"
              />
              <MetricCard
                title="TIR"
                value={indicadores?.tir !== null && indicadores?.tir !== undefined ? `${formatNumber(indicadores.tir)}%` : '—'}
                sub="Tasa Interna de Retorno"
              />
              <MetricCard
                title="Payback"
                value={indicadores?.payback !== null && indicadores?.payback !== undefined ? `${indicadores.payback} años` : '—'}
                sub="Año donde el acumulado pasa a positivo"
              />
            </div>
          </div>

          <div className="mt-4 rs-card">
            <div className="rs-card-title">Flujo de caja</div>

            <div className="rs-chart-wrap">
              <canvas ref={chartRef} width="600" height="300" />
            </div>

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

            <div className="rs-actions">
              <button onClick={exportPDF} className="btn btn-danger me-2">
                Exportar PDF
              </button>
              <button onClick={exportCSV} className="btn btn-success">
                Exportar CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Simulador;
