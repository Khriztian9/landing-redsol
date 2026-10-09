import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_BRAND_COLORS as COLORS, drawBrandLogo, loadBrandLogo, loadPdfImage } from "./brandPdf";

const COMPANY = {
  name: "REDSOLAR S.A.S.",
  phone: "+57 318 346 4183",
  email: "info@redsolarenergy.com",
  website: "www.redsolarenergy.com",
  address: "Av. Las Américas #50-03, Pereira, Risaralda",
};

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const valueOrFallback = (value, suffix = "") =>
  value !== null && value !== undefined && value !== "" ? `${value}${suffix}` : "No disponible";

const titleCase = (value) =>
  valueOrFallback(value)
    .replaceAll("_", " ")
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const formatCOP = (value) => {
  const number = asNumber(value);
  return number === null
    ? "No disponible"
    : number.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });
};

const formatNumber = (value, digits = 0) => {
  const number = asNumber(value);
  return number === null
    ? "No disponible"
    : number.toLocaleString("es-CO", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
};

const formatWithUnit = (value, unit, digits = 0) => {
  const formatted = formatNumber(value, digits);
  return formatted === "No disponible" ? formatted : `${formatted} ${unit}`;
};

const addSectionTitle = (doc, title, y, subtitle) => {
  doc.setFillColor(...COLORS.red);
  doc.roundedRect(15, y, 3, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.black);
  doc.text(title, 23, y + 5);
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(subtitle, 23, y + 10);
  }
};

const addMetricCard = (doc, { x, y, width, label, value, detail, accent = COLORS.red }) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, y, width, 31, 3, 3, "FD");
  doc.setFillColor(...accent);
  doc.roundedRect(x, y, 3, 31, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(label.toUpperCase(), x + 8, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.black);
  doc.text(String(value), x + 8, y + 19, { maxWidth: width - 12 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(detail, x + 8, y + 26, { maxWidth: width - 12 });
};

const addTable = (doc, startY, body, options = {}) => {
  autoTable(doc, {
    startY,
    margin: { left: 15, right: 15 },
    theme: "plain",
    head: options.head ? [options.head] : undefined,
    body,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 3.3, right: 4, bottom: 3.3, left: 4 },
      textColor: COLORS.ink,
      lineColor: COLORS.line,
      lineWidth: { bottom: 0.2 },
      valign: "middle",
    },
    headStyles: {
      fillColor: COLORS.black,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineWidth: 0,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: COLORS.black, cellWidth: options.firstColumnWidth || 62 },
      1: { halign: options.valueAlign || "left" },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    ...options.tableOptions,
  });
  return doc.lastAutoTable.finalY;
};

const addPageChrome = (doc, pageNumber, pageCount, reference, logo) => {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, width, 13, "F");
  if (!drawBrandLogo(doc, logo, { x: 15, y: 4.5, width: 45 })) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(COMPANY.name, 15, 8.5);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(189, 195, 201);
  doc.text(`Propuesta preliminar · ${reference}`, width - 15, 8.5, { align: "right" });

  doc.setDrawColor(...COLORS.line);
  doc.line(15, height - 17, width - 15, height - 17);
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${COMPANY.website}  ·  ${COMPANY.email}  ·  ${COMPANY.phone}`, 15, height - 10);
  doc.text(`Página ${pageNumber} de ${pageCount}`, width - 15, height - 10, { align: "right" });
};

export const generateQuotePdf = async ({ resultado, configuracion, advisorEmail }) => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const [logo, hero] = await Promise.all([
    loadBrandLogo(),
    loadPdfImage("/solar-bg.jpg"),
  ]);
  const today = new Date();
  const date = today.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
  const reference = `RS-${today.toISOString().slice(0, 10).replaceAll("-", "")}-${String(today.getTime()).slice(-4)}`;
  const monthlyMin = asNumber(resultado.generacion_mensual_min);
  const monthlyMax = asNumber(resultado.generacion_mensual_max);
  const annualMin = monthlyMin === null ? null : monthlyMin * 12;
  const annualMax = monthlyMax === null ? null : monthlyMax * 12;
  const generationRange = monthlyMin !== null && monthlyMax !== null
    ? `${formatNumber(monthlyMin)} – ${formatNumber(monthlyMax)} kWh`
    : "No disponible";
  const annualRange = annualMin !== null && annualMax !== null
    ? `${formatNumber(annualMin)} – ${formatNumber(annualMax)} kWh/año`
    : "No disponible";

  // Portada y resumen ejecutivo
  if (hero) {
    doc.addImage(hero, "JPEG", 0, 0, 210, 104, undefined, "FAST");
    doc.setFillColor(...COLORS.black);
    doc.setGState(new doc.GState({ opacity: 0.68 }));
    doc.rect(0, 0, 210, 104, "F");
    doc.setGState(new doc.GState({ opacity: 1 }));
  } else {
    doc.setFillColor(...COLORS.black);
    doc.rect(0, 0, 210, 104, "F");
  }
  // La placa uniforme conserva el contraste del logotipo sobre la fotografía.
  doc.setFillColor(...COLORS.black);
  doc.roundedRect(11, 10, 78, 19, 2, 2, "F");
  doc.setFillColor(...COLORS.red);
  doc.rect(0, 103, 210, 1, "F");
  if (!drawBrandLogo(doc, logo, { x: 17, y: 16.5, width: 66 })) {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(COMPANY.name, 15, 22);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.text("Propuesta solar", 15, 52);
  doc.text("preliminar", 15, 63);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Una visión clara del sistema fotovoltaico ideal para tu consumo.", 15, 73);
  doc.setFontSize(8.5);
  doc.text(`Preparada para ${valueOrFallback(resultado.nombre)}  ·  ${date}`, 15, 90);
  doc.text(`Referencia ${reference}`, 195, 90, { align: "right" });

  addSectionTitle(doc, "Resumen de tu solución", 116, "Estimación basada en la información suministrada.");
  addMetricCard(doc, {
    x: 15, y: 134, width: 56, label: "Potencia instalada",
    value: formatWithUnit(resultado.potencia_kwp, "kWp", 2), detail: "Capacidad estimada del sistema",
  });
  addMetricCard(doc, {
    x: 77, y: 134, width: 56, label: "Paneles solares",
    value: formatNumber(resultado.numero_paneles), detail: "Cantidad estimada de módulos", accent: COLORS.red,
  });
  addMetricCard(doc, {
    x: 139, y: 134, width: 56, label: "Inversión estimada",
    value: formatCOP(resultado.precio_total), detail: "Valor preliminar del proyecto",
  });

  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(15, 175, 180, 40, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text("Producción de energía proyectada", 23, 187);
  doc.setFontSize(19);
  doc.text(generationRange, 23, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Promedio mensual  ·  Proyección anual: ${annualRange}`, 23, 208);

  doc.setFillColor(...COLORS.subtle);
  doc.roundedRect(15, 224, 180, 29, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text(`Objetivo de cobertura: ${valueOrFallback(resultado.porcentaje_generacion ?? configuracion.porcentajeGeneracion, "%")}`, 23, 237);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("La generación real depende de radiación, orientación, sombras, clima y desempeño operativo.", 23, 245);

  // Detalle técnico
  doc.addPage();
  addSectionTitle(doc, "Perfil del proyecto", 24, "Datos utilizados para dimensionar esta alternativa solar.");
  let finalY = addTable(doc, 43, [
    ["Cliente", valueOrFallback(resultado.nombre)],
    ["Dirección", valueOrFallback(resultado.direccion)],
    ["Municipio / departamento", `${valueOrFallback(resultado.municipio)} / ${titleCase(configuracion.ubicacion)}`],
    ["Tipo de servicio", valueOrFallback(resultado.tipo_servicio)],
    ["Estrato", valueOrFallback(resultado.estrato)],
    ["Consumo mensual", formatWithUnit(resultado.consumo_kwh, "kWh")],
  ], { head: ["Información", "Detalle"] });

  addSectionTitle(doc, "Sistema recomendado", finalY + 13, "Configuración preliminar sujeta a validación en sitio.");
  finalY = addTable(doc, finalY + 32, [
    ["Potencia del sistema", formatWithUnit(resultado.potencia_kwp, "kWp", 2)],
    ["Cantidad de paneles", formatNumber(resultado.numero_paneles)],
    ["Inversor recomendado", valueOrFallback(resultado.inversor_utilizado)],
    ["Tipo de sistema", titleCase(configuracion.tipoInversor)],
    ["Estructura existente", titleCase(configuracion.estructura)],
    ["Tipo de cubierta", titleCase(configuracion.cubierta)],
    ["Generación mensual estimada", generationRange],
    ["Generación anual proyectada", annualRange],
  ], { head: ["Componente / indicador", "Especificación"] });

  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(15, finalY + 10, 180, 25, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.black);
  doc.text("¿Qué significa esta estimación?", 22, finalY + 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  const technicalNote = doc.splitTextToSize(
    "El dimensionamiento busca cubrir el porcentaje seleccionado del consumo reportado. La visita técnica permitirá confirmar espacio útil, estado de la cubierta, sombras, punto de conexión y requisitos del operador de red.",
    164
  );
  doc.text(technicalNote, 22, finalY + 26);

  // Inversión, alcance y próximos pasos
  doc.addPage();
  addSectionTitle(doc, "Inversión y alcance", 24, "Valores de referencia para avanzar hacia una propuesta definitiva.");
  finalY = addTable(doc, 43, [
    ["Inversión estimada del sistema", formatCOP(resultado.precio_total)],
    ["Costo de energía de referencia", formatCOP(resultado.costo_energia)],
    ["Cobertura energética objetivo", valueOrFallback(resultado.porcentaje_generacion ?? configuracion.porcentajeGeneracion, "%")],
    ["Vigencia de esta estimación", "15 días calendario"],
  ], { head: ["Concepto", "Valor"], valueAlign: "right", firstColumnWidth: 105 });

  addSectionTitle(doc, "Ruta para hacer realidad tu proyecto", finalY + 14);
  const steps = [
    ["01", "Validación", "Revisamos contigo consumos, factura y objetivos del proyecto."],
    ["02", "Visita técnica", "Verificamos cubierta, sombras, red eléctrica y condiciones de instalación."],
    ["03", "Propuesta final", "Definimos equipos, alcance, cronograma, garantías y forma de pago."],
    ["04", "Instalación", "Ejecutamos el proyecto y acompañamos la puesta en operación."],
  ];
  let stepY = finalY + 33;
  steps.forEach(([number, title, description]) => {
    doc.setFillColor(...COLORS.red);
    doc.circle(22, stepY, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(number, 22, stepY + 1.3, { align: "center" });
    doc.setTextColor(...COLORS.black);
    doc.setFontSize(9.5);
    doc.text(title, 33, stepY - 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(description, 33, stepY + 4);
    stepY += 18;
  });

  addSectionTitle(doc, "Consideraciones importantes", stepY + 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...COLORS.muted);
  const disclaimer = doc.splitTextToSize(
    "Este documento es un estudio preliminar de potencial fotovoltaico y no constituye una oferta comercial vinculante, factura proforma ni contrato. Los valores y la generación son estimaciones y pueden cambiar luego de la visita técnica, el análisis estructural, la disponibilidad de red, las exigencias del operador de red, la selección final de equipos y las condiciones del sitio. La decisión de inversión deberá basarse en la propuesta comercial definitiva y el contrato correspondiente.",
    180
  );
  doc.text(disclaimer, 15, stepY + 18, { lineHeightFactor: 1.45 });

  doc.setFillColor(...COLORS.black);
  doc.roundedRect(15, 246, 180, 24, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("¿Listo para dar el siguiente paso?", 23, 257);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${COMPANY.phone}  ·  ${COMPANY.email}`, 23, 264);
  doc.text(`Asesor: ${advisorEmail || "Equipo REDSOLAR"}`, 187, 261, { align: "right" });

  const pageCount = doc.internal.getNumberOfPages();
  for (let page = 2; page <= pageCount; page += 1) {
    doc.setPage(page);
    addPageChrome(doc, page, pageCount, reference, logo);
  }

  const safeName = String(resultado.nombre || "cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_");
  doc.save(`Propuesta_Redsolar_${safeName}_${reference}.pdf`);
};
