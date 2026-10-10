import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ProjectImage from './ProjectImage';

function PhotoLightbox({ project, activePhoto, onChange, onClose }) {
  const dialogRef = useRef(null);
  const { photos, name } = project;
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  const navigate = (step) => onChange((activePhoto + step + photos.length) % photos.length);
  return createPortal(
    <dialog ref={dialogRef} className="project-lightbox" aria-label={`Galería ampliada de ${name}`}
      onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
      }}>
      <div className="lightbox-surface">
        <header><div><span>Proyecto REDSOLAR</span><h2>{name}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar galería" autoFocus><i className="bi bi-x-lg" aria-hidden="true" /></button></header>
        <div className="lightbox-image"><ProjectImage photo={photos[activePhoto]} sizes="90vw" alt={`Foto ${activePhoto + 1} del proyecto ${name}`} /></div>
        <footer><button type="button" aria-label="Foto anterior" onClick={() => navigate(-1)}><i className="bi bi-arrow-left" aria-hidden="true" /></button><span aria-live="polite">{activePhoto + 1} / {photos.length}</span><button type="button" aria-label="Foto siguiente" onClick={() => navigate(1)}><i className="bi bi-arrow-right" aria-hidden="true" /></button><small>Usa las flechas para explorar · Esc para cerrar</small></footer>
      </div>
    </dialog>, document.body,
  );
}

export default function ProjectGallery({ project }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const showPhoto = (direction) => setActivePhoto(current => (current + direction + project.photos.length) % project.photos.length);
  return (
    <div className="project-media-panel">
      <div className="project-photo-frame">
        <button className="project-photo-hitarea" type="button" aria-label={`Ampliar fotos de ${project.name}`} onClick={() => setIsOpen(true)}>
          <ProjectImage className="project-project-photo" photo={project.photos[activePhoto]} alt={`Foto ${activePhoto + 1} del proyecto solar ${project.name}`} loading="lazy" />
          <span className="photo-expand"><i className="bi bi-arrows-fullscreen" aria-hidden="true" /> Explorar proyecto</span>
        </button>
        <div className="project-photo-controls" aria-label={`Galería de fotos de ${project.name}`}>
          <button className="project-photo-control" type="button" aria-label={`Foto anterior de ${project.name}`} onClick={() => showPhoto(-1)}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          <div className="project-photo-dots">{project.photos.map((photo, index) => <button className={`project-photo-dot ${index === activePhoto ? 'active' : ''}`} type="button" aria-label={`Ver foto ${index + 1} de ${project.name}`} aria-current={index === activePhoto ? 'true' : undefined} key={photo} onClick={() => setActivePhoto(index)} />)}</div>
          <button className="project-photo-control" type="button" aria-label={`Siguiente foto de ${project.name}`} onClick={() => showPhoto(1)}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
          <span className="project-photo-count" aria-live="polite">{activePhoto + 1}/{project.photos.length}</span>
        </div>
      </div>
      <div className="project-media-badge"><i className={`bi ${project.icon}`} aria-hidden="true" /><span>{project.category}</span></div>
      {isOpen && <PhotoLightbox project={project} activePhoto={activePhoto} onChange={setActivePhoto} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
