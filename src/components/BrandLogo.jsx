export default function BrandLogo({ variant = 'light', className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={`/marca/redsolar/logo-${variant === 'dark' ? 'oscuro' : 'claro'}.svg`}
      alt="REDSOLAR"
      width="1800"
      height="163"
      decoding="async"
    />
  );
}
