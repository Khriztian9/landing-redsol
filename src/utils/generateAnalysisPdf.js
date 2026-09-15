import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  navy: [7, 39, 74],
  blue: [0, 153, 255],
  green: [70, 190, 72],
  ink: [31, 45, 61],
  muted: [99, 115, 129],
  line: [220, 228, 235],
  paleBlue: [237, 247, 255],
  paleGreen: [239, 250, 239],
};

const loadImage = (src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = src;
});

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const cop = (value) => {
  const parsed = number(value);
  return parsed === null ? "No disponible" : parsed.toLocaleString("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  });
};

const numeric = (value, digits = 0) => {
  const parsed = number(value);
  return parsed === null ? "No disponible" : parsed.toLocaleString("es-CO", {
    maximumFractionDigits: digits,
  });
};

const sectionTitle = (doc, title, subtitle, y) => {
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(15, y, 3, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.navy);
  doc.text(title, 23, y + 5);
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(subtitle, 23, y + 10);
  }
};

const metricCard = (doc, x, label, value, detail, accent = COLORS.blue) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, 61, 82, 31, 3, 3, "FD");
  doc.setFillColor(...accent);
  doc.roundedRect(x, 61, 3, 31, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(label.toUpperCase(), x + 8, 69);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.navy);
  doc.text(value, x + 8, 80, { maxWidth: 69 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(detail, x + 8, 87, { maxWidth: 69 });
};

const scenarioName = ({ withBenefits, withLeasing }) => {
  if (withBenefits && withLeasing) return "Leasing + beneficios tributarios";
  if (withBenefits) return "Con beneficios tributarios";
  if (withLeasing) return "Con leasing";
  return "Inversión directa sin beneficios tributarios";
};

export const generateAnalysisPdf = async ({ chartCanvas, formData, indicators, table, withBenefits, withLeasing }) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await loadImage("/REDSOL_logo_completo_transparente.png");
  const today = new Date();
  const date = today.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
  const reference = `AF-${today.toISOString().slice(0, 10).replaceAll("-", "")}-${String(today.getTime()).slice(-4)}`;
  const scenario = scenarioName({ withBenefits, withLeasing });

  // Resumen ejecutivo
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, 297, 39, "F");
  if (logo) doc.addImage(logo, "PNG", 15, 9, 47, 11, undefined, "FAST");
  else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("REDSOLAR", 15, 17);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(255, 255, 255);
  doc.text("Análisis financiero fotovoltaico", 282, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(220, 232, 243);
  doc.text(`${scenario}  ·  ${date}  ·  Ref. ${reference}`, 282, 27, { align: "right" });

  sectionTitle(doc, "Resumen ejecutivo", "Indicadores del escenario seleccionado al momento de descargar.", 45);
  metricCard(doc, 15, "Valor Presente Neto (VPN)", cop(indicators?.vpn), "Valor creado a la tasa de descuento", COLORS.blue);
  metricCard(doc, 107.5, "Tasa Interna de Retorno (TIR)", indicators?.tir == null ? "No disponible" : `${numeric(indicators.tir, 2)}%`, "Rentabilidad anual estimada", COLORS.green);
  metricCard(doc, 200, "Periodo de recuperación", indicators?.payback == null ? "No alcanzado" : `${numeric(indicators.payback, 2)} años`, "Primer momento con acumulado positivo", COLORS.blue);

  doc.setFillColor(...(number(indicators?.vpn) >= 0 ? COLORS.paleGreen : COLORS.paleBlue));
  doc.roundedRect(15, 102, 267, 24, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text("Lectura rápida", 23, 111);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.ink);
  const conclusion = number(indicators?.vpn) >= 0
    ? "Bajo los supuestos ingresados, el escenario crea valor financiero. Compare la TIR con su rentabilidad mínima esperada y valide los supuestos antes de invertir."
    : "Bajo los supuestos ingresados, el escenario no recupera la rentabilidad exigida. Revise inversión, autoconsumo, tarifa, costos y alternativas de financiación.";
  doc.text(doc.splitTextToSize(conclusion, 246), 23, 118);

  sectionTitle(doc, "Supuestos principales", "Estos datos determinan la proyección; cualquier cambio puede modificar los resultados.", 137);
  autoTable(doc, {
    startY: 155,
    margin: { left: 15, right: 15 },
    theme: "plain",
    body: [
      ["Generación anual", `${numeric(formData.generacion_anual_kwh)} kWh/año`, "Consumo anual", `${numeric(formData.consumo_anual_usuario)} kWh/año`, "Autoconsumo", `${numeric(formData.porcentaje_autoconsumo * 100, 1)}%`],
      ["Tarifa de compra", `${cop(formData.precio_compra_kwh)}/kWh`, "Precio de bolsa", `${cop(formData.precio_bolsa)}/kWh`, "CAPEX", cop(formData.capex)],
      ["OPEX anual", cop(formData.opex_anual), "Horizonte", `${numeric(formData.horizonte_anios)} años`, "Tasa de descuento", `${numeric(formData.tasa_descuento * 100, 1)}%`],
    ],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3.1, textColor: COLORS.ink, lineColor: COLORS.line, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", textColor: COLORS.navy }, 2: { fontStyle: "bold", textColor: COLORS.navy }, 4: { fontStyle: "bold", textColor: COLORS.navy } },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Gráfica y metodología
  doc.addPage();
  sectionTitle(doc, "Comportamiento del flujo de caja", `Escenario: ${scenario}. Valores nominales anuales en pesos colombianos.`, 20);
  if (chartCanvas) {
    const image = chartCanvas.toDataURL("image/png", 1);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.line);
    doc.roundedRect(15, 40, 178, 119, 3, 3, "FD");
    doc.addImage(image, "PNG", 20, 45, 168, 109, undefined, "FAST");
  }
  doc.setFillColor(...COLORS.paleBlue);
  doc.roundedRect(202, 40, 80, 119, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text("Cómo leer este informe", 211, 53);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...COLORS.ink);
  const notes = [
    "VPN: valor presente de los flujos futuros menos la inversión. Un valor positivo indica creación de valor según la tasa elegida.",
    "TIR: tasa que lleva el VPN a cero. Debe compararse con el costo de capital y el riesgo del proyecto.",
    "Payback: momento en que el flujo acumulado pasa a positivo; no sustituye al VPN ni considera por sí solo el valor del dinero en el tiempo.",
    "La generación se degrada 0,5% anual y el OPEX crece 3% anual, conforme al modelo del simulador.",
  ];
  let noteY = 66;
  notes.forEach((note, index) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}.`, 211, noteY);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(note, 61);
    doc.text(lines, 217, noteY);
    noteY += lines.length * 4 + 6;
  });

  // Detalle anual
  doc.addPage();
  sectionTitle(doc, "Detalle anual de la proyección", "Desglose completo de ingresos, costos y flujos del escenario seleccionado.", 20);
  const columns = Object.keys(table[0] || {});
  autoTable(doc, {
    startY: 39,
    head: [columns],
    body: table.map((row) => columns.map((column) => {
      const value = row[column];
      if (typeof value !== "number") return value;
      if (column === "Año") return numeric(value);
      if (column === "Generación (kWh)") return numeric(value, 1);
      if (column.includes("Tarifa")) return numeric(value, 0);
      return cop(value);
    })),
    margin: { left: 10, right: 10, top: 20, bottom: 18 },
    theme: "striped",
    styles: { font: "helvetica", fontSize: 6.2, cellPadding: 1.8, overflow: "linebreak", textColor: COLORS.ink, lineColor: COLORS.line, lineWidth: 0.1, halign: "right" },
    headStyles: { fillColor: COLORS.navy, textColor: [255, 255, 255], fontStyle: "bold", halign: "center", fontSize: 6.2 },
    alternateRowStyles: { fillColor: [246, 249, 251] },
    columnStyles: { 0: { halign: "center", cellWidth: 11 } },
  });

  const pages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.line);
    doc.line(15, 193, 282, 193);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text("REDSOLAR · Documento informativo, no constituye garantía de desempeño ni asesoría tributaria o financiera.", 15, 199);
    doc.text(`Página ${page} de ${pages}`, 282, 199, { align: "right" });
  }

  doc.save(`Analisis_Financiero_REDSOLAR_${today.toISOString().slice(0, 10)}.pdf`);
};
