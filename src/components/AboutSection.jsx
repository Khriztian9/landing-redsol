import { useState } from 'react';
import { collaborators, founders } from '../data/team';
import TeamCarousel from './TeamCarousel';
import './AboutSection.css';

function FounderPortrait({ founder }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const hasPhoto = founder.photo && founder.photo !== failedPhoto;

  return (
    <div className={`about-portrait ${hasPhoto ? 'has-photo' : 'is-placeholder'}`}>
      {hasPhoto ? (
        <img
          src={founder.photo}
          alt={founder.name}
          width="600"
          height="750"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: founder.photoPosition || 'center' }}
          onError={() => setFailedPhoto(founder.photo)}
        />
      ) : (
        <>
          <div className="about-portrait-orbits" aria-hidden="true"><span /><span /><span /></div>
          <span className="about-portrait-initials" aria-hidden="true">{founder.initials}</span>
          <span className="about-photo-pending">Retrato próximamente</span>
        </>
      )}
      <span className="about-portrait-label">{founder.title}</span>
      <span className="about-portrait-mark" aria-hidden="true"><i className="bi bi-arrow-up-right" /></span>
    </div>
  );
}

function FounderCard({ founder, className }) {
  return (
    <article className={`about-founder ${className}`} aria-labelledby={`${founder.id}-name`} data-reveal>
      <FounderPortrait founder={founder} />
      <div className="about-founder-copy">
        <span className="about-founder-role">{founder.role}</span>
        <h3 id={`${founder.id}-name`}>{founder.name}</h3>
        <p className="about-founder-profession">{founder.profession}</p>
        <p className="about-founder-description">{founder.description}</p>
      </div>
    </article>
  );
}

export default function AboutSection() {
  return (
    <section id="quienes-somos" className="about-section section-space" aria-labelledby="about-title">
      <div className="container">
        <div className="about-section-topline" data-reveal>
          <span className="section-kicker">03 / Quiénes somos</span>
          <span className="about-topline-note">Dos fundadores. Un propósito compartido.</span>
        </div>

        <div className="about-founders-grid">
          <div className="about-story" data-reveal>
            <span className="about-sun" aria-hidden="true"><i className="bi bi-sun" /></span>
            <h2 id="about-title">Nos mueve<br />nuestra región.<br /><span>Nos une el sol.</span></h2>
            <p>Somos Christian y Katherine, esposos y cofundadores de REDSOLAR. Nos une el amor por nuestra región y una convicción: <strong>la energía solar puede impulsar su productividad y competitividad.</strong></p>
            <p>Por eso, sumamos conocimiento técnico y compromiso legal para llevar ese propósito a cada proyecto.</p>
            <a className="text-link about-team-link" href="#equipo-redsolar">Conoce a nuestro equipo <i className="bi bi-arrow-down" aria-hidden="true" /></a>
          </div>
          <FounderCard founder={founders[0]} className="about-founder-christian" />
          <FounderCard founder={founders[1]} className="about-founder-katherine" />
        </div>

        <div className="about-purpose" data-reveal>
          <span className="about-purpose-label"><i className="bi bi-heart" aria-hidden="true" /> Lo que nos mueve</span>
          <p>Creemos en una región que crece con <strong>la energía de su gente y la fuerza del sol.</strong></p>
          <a href="#contacto" aria-label="Hablemos de tu proyecto"><i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
        </div>

        <TeamCarousel members={collaborators} />
      </div>
    </section>
  );
}
