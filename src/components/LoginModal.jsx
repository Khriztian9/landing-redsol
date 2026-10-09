import { useEffect, useRef } from 'react';
import BrandLogo from './BrandLogo';

function LoginModal({ email, password, error, onClose, onSubmit, onEmailChange, onPasswordChange }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current.querySelector('input').focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const handleKeys = (event) => {
    if (event.key === 'Escape') onClose();
    if (event.key !== 'Tab') return;
    const controls = dialogRef.current.querySelectorAll('button, input, a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };

  return (
    <div className="brand-modal-backdrop" onKeyDown={handleKeys}>
      <section className="brand-login" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="login-close" type="button" onClick={onClose} aria-label="Cerrar acceso"><i className="bi bi-x-lg" aria-hidden="true" /></button>
        <BrandLogo />
        <span className="section-kicker">Equipo REDSOLAR</span>
        <h2 id="login-title">Tu espacio de trabajo.</h2>
        <p>Accede a tus cotizaciones y herramientas de análisis solar.</p>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" type="email" autoComplete="username" className="form-control" value={email}
              onChange={(event) => onEmailChange(event.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" autoComplete="current-password" className="form-control" value={password}
              onChange={(event) => onPasswordChange(event.target.value)} required />
          </div>
          <button type="submit" className="btn btn-redsolar-primary w-100">Iniciar sesión <i className="bi bi-arrow-right" aria-hidden="true" /></button>
        </form>
      </section>
    </div>
  );
}

export default LoginModal;
