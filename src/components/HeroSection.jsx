import { useEffect, useRef, useState } from 'react';
import './HeroSection.css';

const videoSrc = '/videos/cardisel-la-romelia.mp4';
const posterSrc = '/images/projects/cardisel-la-romelia-poster.webp';

export default function HeroSection() {
  const videoRef = useRef(null);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const respectPlaybackPreference = () => {
      if (motionPreference.matches || connection?.saveData) {
        video.pause();
        return;
      }
      // Muted playback may still be blocked by the browser. Native controls
      // remain available so the visitor can start the video themselves.
      video.play()?.catch(() => {});
    };

    respectPlaybackPreference();
    motionPreference.addEventListener('change', respectPlaybackPreference);
    connection?.addEventListener?.('change', respectPlaybackPreference);
    return () => {
      motionPreference.removeEventListener('change', respectPlaybackPreference);
      connection?.removeEventListener?.('change', respectPlaybackPreference);
      video.pause();
    };
  }, [videoUnavailable]);

  return (
    <section id="inicio" className="romelia-hero" aria-labelledby="hero-title">
      <div className="container romelia-grid">
        <div className="romelia-copy">
          <span className="section-kicker"><span className="romelia-status-dot" /> Energía solar en Colombia</span>
          <h1 id="hero-title">Energía solar.<br /><span>A tu medida.</span></h1>
          <p>Transformamos el sol en oportunidades para tu hogar y tu empresa. Diseño, instalación y legalización en un solo equipo.</p>
          <div className="romelia-actions">
            <a className="btn btn-redsolar-primary" href="#cotizador-factura">Cotiza tu proyecto <i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
            <a className="romelia-secondary" href="#proyectos">Conoce nuestro trabajo <i className="bi bi-arrow-right" aria-hidden="true" /></a>
          </div>
          <div className="romelia-sectors"><span>Hogares</span><span>Comercios</span><span>Industria</span></div>
        </div>

        <figure className="romelia-project">
          <div className="romelia-video-frame">
            {videoUnavailable ? (
              <img src={posterSrc} width="478" height="850" alt="Vista aérea de la instalación solar de Cardisel La Romelia" />
            ) : (
              <video ref={videoRef} src={videoSrc} poster={posterSrc} width="478" height="850"
                controls muted loop playsInline preload="metadata"
                aria-label="Video del proyecto solar Cardisel La Romelia"
                onError={() => setVideoUnavailable(true)}>
                <a href={videoSrc}>Ver video de Cardisel La Romelia</a>
              </video>
            )}
          </div>
          <figcaption>
            <span className="romelia-project-label">Proyecto REDSOLAR</span>
            <strong>Cardisel La Romelia</strong>
            <span>Energía solar en acción.</span>
            {videoUnavailable && <a className="romelia-secondary" href={videoSrc}>Ver video <i className="bi bi-play-circle" aria-hidden="true" /></a>}
          </figcaption>
        </figure>
      </div>
      <div className="container romelia-bottom">
        <span>Diseño a medida <i aria-hidden="true">/</i> Instalación <i aria-hidden="true">/</i> Legalización</span>
        <a href="#servicios">Descubre cómo <i className="bi bi-arrow-down" aria-hidden="true" /></a>
      </div>
    </section>
  );
}
