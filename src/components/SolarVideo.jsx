import { useState } from 'react';
import ProjectImage from './ProjectImage';

export default function SolarVideo() {
  const [playing, setPlaying] = useState(false);
  return <div className="responsive-video">{playing ? <iframe src="https://www.youtube-nocookie.com/embed/bNO_ha_oO20?autoplay=1" title="Conoce la tecnología solar de LIVOLTEK" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : <button type="button" className="video-poster" aria-label="Reproducir video sobre tecnología LIVOLTEK" onClick={() => setPlaying(true)}><ProjectImage photo="sonreir-1" sizes="(max-width: 767px) 100vw, 650px" loading="lazy" alt="Instalación de un inversor LIVOLTEK en el proyecto Clínica Sonreír" /><span className="video-play"><i className="bi bi-play-fill" aria-hidden="true" /></span><span className="video-label">Conoce la tecnología <strong>Reproducir video</strong></span></button>}</div>;
}
