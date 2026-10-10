import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Quote = lazy(() => import('./Cotizadorfactura'));
const LoadingQuote = () => <div className="quote-loading" role="status"><span className="spinner-border spinner-border-sm" aria-hidden="true" /> Preparando tu cotizador…</div>;

export default function DeferredQuote() {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '300px' });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={containerRef} className="deferred-quote">{ready ? <Suspense fallback={<LoadingQuote />}><Quote /></Suspense> : <div className="quote-loading"><h2>Cotiza tu sistema solar.</h2><p>Conoce el potencial de tu hogar o empresa.</p><button type="button" className="btn btn-redsolar-primary" onClick={() => setReady(true)}>Abrir cotizador</button></div>}</div>;
}
