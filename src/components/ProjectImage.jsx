import images from '../data/projectImages.json';

export default function ProjectImage({ photo, sizes = '(max-width: 767px) calc(100vw - 40px), 600px', ...props }) {
  const variants = images[photo];
  const largest = variants[variants.length - 1];
  return <img {...props} src={largest.src} srcSet={variants.map(image => `${image.src} ${image.width}w`).join(', ')} sizes={sizes} width={largest.width} height={largest.height} decoding="async" />;
}
