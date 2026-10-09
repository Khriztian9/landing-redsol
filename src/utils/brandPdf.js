// Paleta y logotipos oficiales del kit corporativo REDSOLAR.
export const PDF_BRAND_COLORS = {
  black: [16, 17, 20],
  red: [237, 28, 36],
  white: [255, 255, 255],
  ink: [36, 39, 43],
  muted: [86, 91, 99],
  line: [218, 221, 225],
  surface: [245, 246, 247],
  subtle: [255, 241, 242],
};

export const loadPdfImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

export const loadBrandLogo = (background = "dark") =>
  loadPdfImage(`/marca/redsolar/logo-${background === "dark" ? "oscuro" : "claro"}-720.png`);

export const drawBrandLogo = (doc, logo, { x, y, width }) => {
  if (!logo) return false;
  const height = width * (logo.naturalHeight / logo.naturalWidth);
  doc.addImage(logo, "PNG", x, y, width, height, undefined, "FAST");
  return true;
};
