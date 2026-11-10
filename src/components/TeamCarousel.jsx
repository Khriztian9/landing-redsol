import { useCallback, useEffect, useId, useRef, useState } from 'react';
import './TeamCarousel.css';

const previewSlots = Array.from({ length: 4 }, (_, index) => ({
  id: `preview-${index + 1}`,
  preview: true,
}));

function PersonOutline() {
  return (
    <svg viewBox="0 0 96 112" fill="none" aria-hidden="true">
      <circle cx="48" cy="32" r="19" />
      <path d="M13 103V94C13 75 28 62 48 62S83 75 83 94V103" />
      <path d="M4 107H92" />
    </svg>
  );
}

function TeamPortrait({ member }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const hasPhoto = member.photo && failedPhoto !== member.photo;
  const initials = member.name?.trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map(part => part[0]).join('').toUpperCase();

  return (
    <div className={`team-portrait${hasPhoto ? ' team-portrait-photo' : ''}`}>
      {hasPhoto ? (
        <img
          src={member.photo}
          alt={member.name ? `Retrato de ${member.name}` : 'Retrato de un integrante del equipo'}
          style={{ objectPosition: member.photoPosition || 'center' }}
          loading="lazy"
          decoding="async"
          onError={() => setFailedPhoto(member.photo)}
        />
      ) : (
        <>
          <span className="team-portrait-orbit" aria-hidden="true" />
          <div className="team-portrait-mark" aria-hidden="true">
            {initials ? <span className="team-initials">{initials}</span> : <PersonOutline />}
          </div>
          <span className="team-photo-pending">Fotografía próximamente</span>
        </>
      )}
      {member.preview && <span className="team-preview-tag">Vista previa</span>}
    </div>
  );
}

export default function TeamCarousel({ members = [] }) {
  const hasMembers = Array.isArray(members) && members.length > 0;
  const items = hasMembers ? members : previewSlots;
  const instanceId = useId();
  const headingId = `team-heading-${instanceId}`;
  const viewportId = `team-viewport-${instanceId}`;
  const hintId = `team-hint-${instanceId}`;
  const viewportRef = useRef(null);
  const [position, setPosition] = useState({ atStart: true, atEnd: true, first: 1, last: 1 });
  const [announcement, setAnnouncement] = useState('');

  const measurePosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const cards = Array.from(viewport.children);
    const visible = cards.reduce((indices, card, index) => {
      const cardBounds = card.getBoundingClientRect();
      const overlap = Math.min(cardBounds.right, bounds.right) - Math.max(cardBounds.left, bounds.left);
      if (overlap > Math.min(cardBounds.width / 2, 40)) indices.push(index + 1);
      return indices;
    }, []);
    const next = {
      atStart: viewport.scrollLeft <= 2,
      atEnd: viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft <= 2,
      first: visible[0] || 1,
      last: visible.at(-1) || 1,
    };
    setPosition(current => Object.keys(next).every(key => current[key] === next[key]) ? current : next);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measurePosition);
    };
    measurePosition();
    viewport.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure);
    observer?.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      viewport.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [items.length, measurePosition]);

  const rangeLabel = position.first === position.last
    ? `${position.first} de ${items.length}`
    : `${position.first} a ${position.last} de ${items.length}`;
  const status = `${hasMembers ? 'Perfiles' : 'Espacios de vista previa'} ${rangeLabel}`;

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(status), 180);
    return () => window.clearTimeout(timer);
  }, [status]);

  const navigate = direction => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const origin = viewport.firstElementChild?.offsetLeft || 0;
    const stops = Array.from(viewport.children, card => Math.min(card.offsetLeft - origin, maximum));
    let left;
    if (direction === 'start') left = 0;
    else if (direction === 'end') left = maximum;
    else if (direction > 0) left = stops.find(stop => stop > viewport.scrollLeft + 2) ?? maximum;
    else left = stops.filter(stop => stop < viewport.scrollLeft - 2).at(-1) ?? 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({ left, behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  const onKeyDown = event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target !== event.currentTarget) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1, Home: 'start', End: 'end' }[event.key];
    if (direction !== undefined) {
      event.preventDefault();
      navigate(direction);
    }
  };

  return (
    <section id="equipo-redsolar" className="team-carousel" aria-labelledby={headingId} aria-roledescription="carrusel">
      <div className="team-heading">
        <div className="team-heading-copy">
          <p className="team-kicker"><span aria-hidden="true" /> Nuestra gente</p>
          <h3 id={headingId}>El equipo que hace posible cada proyecto</h3>
        </div>
        <p className="team-intro">
          Personas que comparten nuestra convicción: la energía solar puede impulsar el futuro de nuestra región.
        </p>
      </div>
      {!hasMembers && (
        <p className="team-pending-note">
          Pronto conocerás a nuestros colaboradores. Estamos preparando sus fotografías e historias; estos espacios son una vista previa.
        </p>
      )}
      <ul
        className="team-viewport"
        id={viewportId}
        ref={viewportRef}
        tabIndex={0}
        aria-label={hasMembers ? 'Perfiles de nuestros colaboradores' : 'Vista previa de los perfiles del equipo'}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
      >
        {items.map((member, index) => (
          <li className={`team-card${member.preview ? ' team-card-preview' : ''}`} key={member.id ?? `${member.name}-${index}`}>
            <TeamPortrait member={member} />
            <div className="team-card-copy">
              <p className="team-role">{member.preview ? 'Perfil por completar' : member.role || 'Equipo RedSolar'}</p>
              <h4>{member.preview ? 'Una historia por compartir' : member.name || 'Integrante del equipo'}</h4>
              <p className="team-description">
                {member.preview
                  ? 'Aquí conocerás su nombre, su labor y su aporte a cada proyecto.'
                  : member.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="team-footer">
        <p id={hintId} className="team-hint">
          <span className="team-hint-desktop">Explora con las flechas. Con el teclado, usa ← →, Inicio o Fin.</span>
          <span className="team-hint-mobile">Desliza para descubrir más.</span>
        </p>
        <div className="team-navigation">
          <span className="team-count" aria-hidden="true">{hasMembers ? rangeLabel : `Vista previa · ${rangeLabel}`}</span>
          <button
            className="team-arrow"
            type="button"
            aria-label="Ver perfiles anteriores"
            aria-controls={viewportId}
            disabled={position.atStart}
            onClick={() => navigate(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            className="team-arrow"
            type="button"
            aria-label="Ver perfiles siguientes"
            aria-controls={viewportId}
            disabled={position.atEnd}
            onClick={() => navigate(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <p className="team-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  );
}
