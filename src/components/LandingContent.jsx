import { useState } from 'react';
import CotizadorFactura from './Cotizadorfactura';
import BrandLogo from './BrandLogo';

const featuredProjects = [
  {
    category: 'Residencial',
    name: 'Familia Fortich',
    location: 'Vivienda familiar',
    poster: '/FORTICH0.JPG',
    photos: ['/FORTICH0.JPG', '/FORTICH1.jpg', '/FORTICH2.jpg'],
    icon: 'bi-house-heart',
    summary:
      'Un sistema solar pensado para bajar el consumo mensual y darle independencia energética a una familia que quería una solución limpia, silenciosa y durable.',
    stats: [
      { value: '6.9 kWp', label: '12 paneles' },
      { value: '5 kW', label: 'inversor' },
    ],
    details: ['Diseño según curva de consumo', 'Instalación limpia y estética', 'Acompañamiento técnico REDSOLAR'],
  },
  {
    category: 'Comercial',
    name: 'Clínica Sonreír',
    location: 'Consultorio odontológico',
    poster: '/SONREIR0.png',
    photos: ['/SONREIR0.png', '/SONREIR1.JPG', '/SONREIR2.png'],
    icon: 'bi-building-check',
    summary:
      'Energía solar para una operación comercial que necesita continuidad, control de costos y una imagen sostenible frente a sus pacientes y visitantes.',
    stats: [
      { value: '7.8 kWp', label: '12 paneles' },
      { value: '6 kW', label: 'inversor' },
    ],
    details: ['Alto autoconsumo', 'Reducción de gasto energético', 'independencia energética'],
  },
  {
    category: 'Industrial',
    name: 'GYTE',
    location: 'Industria metalmecánica',
    poster: '/GYTE0.JPG',
    photos: ['/GYTE0.JPG', '/GYTE1.jpg', '/GYTE2.JPG'],
    icon: 'bi-lightning-charge',
    summary:
      'Una solución fotovoltaica robusta para industria, enfocada en alto desempeño, seguridad electrica y respaldo a procesos de consumo exigente.',
    stats: [
      { value: '31.2 kWp', label: '48 paneles' },
      { value: '25 kW', label: 'inversor' },
    ],
    details: ['Ingeniería para grandes superficies', 'Instalación con criterios de seguridad', 'Monitoreo y soporte especializado'],
  },
];

const serviceHighlights = [
  {
    icon: 'bi-diagram-3',
    title: 'Diseño solar',
    text: 'Dimensionamos el sistema según consumo, área disponible y objetivo de ahorro.',
  },
  {
    icon: 'bi-file-earmark-check',
    title: 'Legalización',
    text: 'Te acompañamos con trámites, documentación y relación con el operador de red.',
  },
  {
    icon: 'bi-tools',
    title: 'Instalación',
    text: 'Montaje, puesta en marcha y soporte para sistemas residenciales, comerciales e industriales.',
  },
];

function ProjectMedia({ project }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const projectPhotos = project.photos?.length ? project.photos : [project.poster];

  const showPhoto = (direction) => {
    setActivePhoto((current) => (current + direction + projectPhotos.length) % projectPhotos.length);
  };

  return (
    <div className="project-media-panel">
      <div className="project-photo-frame">
        <button
          className="project-photo-hitarea"
          type="button"
          aria-label={`Ver siguiente foto de ${project.name}`}
          onClick={() => showPhoto(1)}
        >
          <img
            className="project-project-photo"
            src={projectPhotos[activePhoto]}
            alt={`Foto ${activePhoto + 1} del proyecto solar ${project.name}`}
            loading="lazy"
          />
        </button>

        <div className="project-photo-controls" aria-label={`Galería de fotos de ${project.name}`}>
          <button
            className="project-photo-control"
            type="button"
            aria-label={`Foto anterior de ${project.name}`}
            onClick={() => showPhoto(-1)}
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <div className="project-photo-dots">
            {projectPhotos.map((photo, index) => (
              <button
                className={`project-photo-dot ${index === activePhoto ? 'active' : ''}`}
                type="button"
                aria-label={`Ver foto ${index + 1} de ${project.name}`}
                aria-current={index === activePhoto ? 'true' : undefined}
                key={photo}
                onClick={() => setActivePhoto(index)}
              ></button>
            ))}
          </div>
          <button
            className="project-photo-control"
            type="button"
            aria-label={`Siguiente foto de ${project.name}`}
            onClick={() => showPhoto(1)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <span className="project-photo-count">{activePhoto + 1}/{projectPhotos.length}</span>
        </div>
      </div>

      <div className="project-media-shade"></div>
      <div className="project-media-badge">
        <i className={`bi ${project.icon}`} aria-hidden="true"></i>
        <span>{project.category}</span>
      </div>
    </div>
  );
}

const questions = [
  ['¿Cómo sé si mi proyecto solar es viable?', 'Revisamos tu factura, los horarios de consumo, el área disponible y las condiciones de conexión. Con esa información definimos el tamaño del sistema y su alcance técnico.'],
  ['¿Cuánto tarda una instalación fotovoltaica?', 'Depende del tamaño y los permisos. Un sistema residencial suele instalarse en pocos días después de completar la ingeniería y las aprobaciones.'],
  ['¿REDSOLAR también hace la legalización?', 'Sí. Te acompañamos con el diseño, la documentación y los trámites ante el operador de red correspondiente.'],
  ['¿El sistema funciona cuando se va la energía?', 'Un sistema conectado a la red normalmente se apaga por seguridad durante los cortes. Si necesitas respaldo, evaluamos una solución con baterías o configuración híbrida.'],
  ['¿Qué mantenimiento necesita?', 'Recomendamos limpieza periódica, revisión eléctrica y seguimiento de la producción. La frecuencia depende del polvo, las sombras y las condiciones del lugar.'],
];

function LandingContent() {
  return (
    <>
      <main id="contenido-principal">
        <section id="inicio" className="brand-hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="section-kicker"><span className="status-dot" /> Energía solar en Colombia</span>
              <h1 id="hero-title">Tu energía.<br /><span>A tu medida.</span></h1>
              <p>Transformamos el sol en oportunidades para tu hogar y tu empresa. Diseño, instalación y legalización en un solo equipo.</p>
              <div className="hero-actions">
                <a className="btn btn-redsolar-primary" href="#cotizador-factura">Cotiza tu proyecto <i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
                <a className="hero-secondary" href="#proyectos">Conoce nuestro trabajo <i className="bi bi-arrow-right" aria-hidden="true" /></a>
              </div>
              <div className="hero-sectors"><span>Hogares</span><span>Comercios</span><span>Industria</span></div>
            </div>
            <div className="hero-visual">
              <img className="hero-project" src="/FORTICH0.JPG" alt="Instalación de paneles solares del proyecto Familia Fortich" width="1600" height="1200" fetchPriority="high" />
              <div className="hero-photo-caption"><span><i className="bi bi-sun" aria-hidden="true" /> Ingeniería que se ve.</span><a href="#proyectos" aria-label="Ver los proyectos REDSOLAR"><i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div>
              <div className="hero-signature"><BrandLogo variant="dark" /><span>Diseñamos hoy. Generamos futuro.</span></div>
            </div>
          </div>
          <div className="container hero-bottom"><span>Una nueva forma de vivir la energía.</span><a href="#servicios">Descubre cómo <i className="bi bi-arrow-down" aria-hidden="true" /></a></div>
        </section>

        <section id="servicios" className="services-section section-space" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading split-heading">
              <div><span className="section-kicker">01 / Soluciones</span><h2 id="services-title">Del primer plano<br />al primer kilovatio.</h2></div>
              <p>Cada proyecto empieza contigo. Entendemos tu consumo y te acompañamos en cada paso para convertirlo en energía solar.</p>
            </div>
            <div className="services-grid">
              {serviceHighlights.map((service, index) => (
                <article className="service-card-redsolar" key={service.title}>
                  <div className="service-top"><i className={`bi ${service.icon}`} aria-hidden="true" /><span>0{index + 1}</span></div>
                  <h3>{service.title}</h3><p>{service.text}</p>
                  <a href="#contacto">Hablemos de tu proyecto <i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proyectos" className="project-showcase-section section-space" aria-labelledby="projects-title">
          <div className="container">
            <div className="section-heading split-heading">
              <div><span className="section-kicker">02 / Nuestro trabajo</span><h2 id="projects-title">Proyectos reales.<br />Energía en movimiento.</h2></div>
              <p>Soluciones diferentes, un mismo compromiso: diseñar un sistema que responda a las necesidades de cada espacio.</p>
            </div>
            <div className="project-showcase-list">
              {featuredProjects.map((project, index) => (
                <article className={`project-feature ${index % 2 === 1 ? 'project-feature-reverse' : ''}`} key={project.name}>
                  <ProjectMedia project={project} />
                  <div className="project-info-panel">
                    <span className="project-sector">{project.category}</span>
                    <h3>{project.name}</h3><p className="project-location">{project.location}</p>
                    <p className="project-summary">{project.summary}</p>
                    <div className="project-stats" aria-label={`Características de ${project.name}`}>
                      {project.stats.map((stat) => <div className="project-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
                    </div>
                    <ul className="project-details">{project.details.map(detail => <li key={detail}><i className="bi bi-check2" aria-hidden="true" />{detail}</li>)}</ul>
                    <a className="project-cta" href="#cotizador-factura">Quiero un proyecto así <i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="intro-video-section section-space" aria-labelledby="process-title">
          <div className="container intro-video-grid">
            <div className="process-copy"><span className="section-kicker">03 / Ingeniería con criterio</span><h2 id="process-title">El respaldo está<br />en los detalles.</h2><p>Antes de instalar, revisamos consumo, espacio, retorno y conexión. Después, acompañamos la puesta en marcha de tu sistema.</p><a className="text-link" href="#contacto">Conversemos <i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div>
            <div className="process-video"><div className="responsive-video"><iframe src="https://www.youtube.com/embed/bNO_ha_oO20" loading="lazy" title="Conoce la tecnología solar de LIVOLTEK" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><p><span>TECNOLOGÍA SOLAR</span> Conoce más sobre LIVOLTEK <i className="bi bi-play-circle" aria-hidden="true" /></p></div>
          </div>
        </section>

        <section id="cotizador-factura" className="quote-section section-space" aria-label="Cotiza tu sistema solar">
          <div className="container"><CotizadorFactura /></div>
        </section>

        <section id="faq-solar" className="faq-section section-space" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="faq-intro"><span className="section-kicker">Antes de empezar</span><h2 id="faq-title">Resolvamos<br />tus dudas.</h2><p>Tomar una buena decisión empieza por tener información clara.</p><a className="text-link" href="#contacto">Tengo otra pregunta <i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div>
            <div className="faq-list">{questions.map(([question, answer], index) => <details className="faq-item" key={question} open={index === 0}><summary><span>{question}</span><i className="bi bi-plus-lg" aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section id="contacto" className="contact-section section-space" aria-labelledby="contact-title">
          <div className="container contact-grid">
            <div className="contact-copy"><span className="section-kicker">El siguiente paso es tuyo</span><h2 id="contact-title">Hagamos espacio<br />para el sol.</h2><p>Cuéntanos qué tienes en mente. Te ayudamos a encontrar la solución que tu hogar o empresa necesita.</p><a className="contact-whatsapp" href="https://wa.me/573183464183" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp" aria-hidden="true" /><span>Hablemos por WhatsApp<strong>+57 318 346 4183</strong></span><i className="bi bi-arrow-up-right" aria-hidden="true" /></a><a className="contact-email" href="mailto:info@redsolarenergy.com">info@redsolarenergy.com</a></div>
            <form className="contact-form" action="https://formspree.io/f/xwpbbnqv" method="POST">
              <h3>Cuéntanos sobre tu proyecto</h3>
              <div className="contact-form-row"><div><label htmlFor="contact-name">Nombre</label><input id="contact-name" type="text" name="nombre" autoComplete="name" className="form-control" required /></div><div><label htmlFor="contact-phone">WhatsApp</label><input id="contact-phone" type="tel" name="telefono" autoComplete="tel" className="form-control" required /></div></div>
              <div><label htmlFor="contact-email">Correo electrónico</label><input id="contact-email" type="email" name="correo" autoComplete="email" className="form-control" required /></div>
              <div><label htmlFor="contact-message">¿Qué necesitas?</label><textarea id="contact-message" name="mensaje" className="form-control" rows="3" required placeholder="Tipo de espacio, ubicación o idea de proyecto…" /></div>
              <button type="submit" className="btn btn-redsolar-primary">Enviar solicitud <i className="bi bi-arrow-up-right" aria-hidden="true" /></button>
            </form>
          </div>
        </section>
      </main>

      <footer className="brand-footer">
        <div className="container">
          <div className="footer-main"><div className="footer-brand"><a href="#inicio" aria-label="REDSOLAR, volver al inicio"><BrandLogo variant="dark" /></a><p>Tu energía. A tu medida.</p></div><div className="footer-links"><a href="#servicios">Soluciones</a><a href="#proyectos">Proyectos</a><a href="#cotizador-factura">Cotizador</a><a href="#faq-solar">Preguntas frecuentes</a></div><div className="footer-social"><a href="https://instagram.com/redsolarenergy" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram" aria-hidden="true" /> Instagram <i className="bi bi-arrow-up-right" aria-hidden="true" /></a><a href="https://wa.me/573183464183" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp" aria-hidden="true" /> WhatsApp <i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div></div>
          <div className="footer-bottom"><small>© {new Date().getFullYear()} REDSOLAR. Todos los derechos reservados.</small><span>Energía solar para Colombia.</span></div>
        </div>
      </footer>
      <a href="https://wa.me/573183464183" className="floating-contact" target="_blank" rel="noopener noreferrer" aria-label="Hablar con REDSOLAR por WhatsApp"><i className="bi bi-whatsapp" aria-hidden="true" /></a>
    </>
  );
}

export default LandingContent;
