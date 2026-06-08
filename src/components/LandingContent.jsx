import { useState } from 'react';
import CotizadorFactura from './Cotizadorfactura';

const featuredProjects = [
  {
    category: 'Residencial',
    name: 'Familia Fortich',
    location: 'Vivienda familiar',
    poster: '/FORTICH0.JPG',
    photos: ['/FORTICH0.JPG', '/FORTICH1.jpg', '/FORTICH2.jpg'],
    icon: 'bi-house-heart',
    summary:
      'Un sistema solar pensado para bajar el consumo mensual y darle independencia energetica a una familia que queria una solucion limpia, silenciosa y durable.',
    stats: [
      { value: '6.9 kWp', label: '12 paneles' },
      { value: '5kW', label: 'inversor' },
      { value: '100%', label: 'ahorro' },
    ],
    details: ['Diseño segun curva de consumo', 'Instalacion limpia y estética', 'Acompanamiento técnico RedSol'],
  },
  {
    category: 'Comercial',
    name: 'Clinica Sonreir',
    location: 'consultorio odontológico',
    poster: '/SONREIR0.png',
    photos: ['/SONREIR0.png', '/SONREIR1.JPG', '/SONREIR2.png'],
    icon: 'bi-building-check',
    summary:
      'Energia solar para una operacion comercial que necesita continuidad, control de costos y una imagen sostenible frente a sus pacientes y visitantes.',
    stats: [
      { value: '7.8kWp', label: '12 paneles' },
      { value: '6kW', label: 'inversor' },
      { value: '100%', label: 'ahorro' },
    ],
    details: ['Alto autoconsumo', 'Reduccion de gasto energetico', 'independencia energética'],
  },
  {
    category: 'Industrial',
    name: 'GYTE',
    location: 'Industria metalmecánica',
    poster: '/GYTE0.JPG',
    photos: ['/GYTE0.JPG', '/GYTE1.jpg', '/GYTE2.JPG'],
    icon: 'bi-lightning-charge',
    summary:
      'Una solucion fotovoltaica robusta para industria, enfocada en alto desempeno, seguridad electrica y respaldo a procesos de consumo exigente.',
    stats: [
      { value: '31.2kWp', label: '48 paneles' },
      { value: '25kW', label: 'inversor' },
      { value: '130%', label: 'ahorro' },
    ],
    details: ['Ingenieria para grandes superficies', 'Instalacion con criterios de seguridad', 'Monitoreo y soporte especializado'],
  },
];

const serviceHighlights = [
  {
    icon: 'bi-diagram-3',
    title: 'Diseno solar',
    text: 'Dimensionamos el sistema segun consumo, area disponible y objetivo de ahorro.',
  },
  {
    icon: 'bi-file-earmark-check',
    title: 'Legalizacion',
    text: 'Te acompanamos con tramites, documentacion y relacion con el operador de red.',
  },
  {
    icon: 'bi-tools',
    title: 'Instalacion',
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

        <div className="project-photo-controls" aria-label={`Galeria de fotos de ${project.name}`}>
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

function LandingContent() {
  return (
    <main id="contenido-principal">

      <section className="intro-video-section" data-aos="fade-up" data-aos-delay="150">
        <div className="container">
          <div className="intro-video-grid">
            <div>
              <span className="section-kicker">Como trabajamos</span>
              <h2>Ingenieria solar con criterio, estetica y respaldo</h2>
              <p>
                Antes de instalar, revisamos consumo, espacio, retorno y proceso de conexion. Asi cada proyecto se siente ordenado desde el diagnostico hasta la entrega.
              </p>
            </div>
            <div className="responsive-video">
              <iframe
                src="https://www.youtube.com/embed/bNO_ha_oO20"
                loading="lazy"
                title="Video de LIVOLTEK"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="services-section" data-aos="fade-up" data-aos-delay="100">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">Servicios</span>
            <h2>Todo el proceso en una sola ruta</h2>
            <p>Disenamos, legalizamos e instalamos con foco en ahorro real y operacion segura.</p>
          </div>

          <div className="services-grid">
            {serviceHighlights.map((service) => (
              <article className="service-card-redsol" key={service.title}>
                <i className={`bi ${service.icon}`} aria-hidden="true"></i>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cotizador-factura" className="quote-section" data-aos="fade-up-right" data-aos-delay="100">
        <CotizadorFactura />
      </section>

      <section id="proyectos" className="project-showcase-section" data-aos="slide-up" data-aos-delay="100">
        <div className="container">
          <div className="project-showcase-header">
            <span className="section-kicker">Casos reales </span>
            <h2>Proyectos solares REDSOL</h2>
            <p>
              Tres tipos de energia solar en accion: residencial, comercial e industrial.
              Cada caso muestra como disenamos soluciones eficientes segun el consumo, el espacio y la operacion.
            </p>
          </div>

          <div className="project-showcase-list">
            {featuredProjects.map((project, index) => (
              <article
                className={`project-feature ${index % 2 === 1 ? 'project-feature-reverse' : ''}`}
                key={project.name}
                data-aos="fade-up"
                data-aos-delay={150 + index * 100}
              >
                <ProjectMedia project={project} />

                <div className="project-info-panel">
                  <span className="project-sector">{project.category}</span>
                  <h3>{project.name}</h3>
                  <p className="project-location">
                    <i className="bi bi-geo-alt" aria-hidden="true"></i>
                    {project.location}
                  </p>
                  <p className="project-summary">{project.summary}</p>

                  <div className="project-stats" aria-label={`Indicadores del proyecto ${project.name}`}>
                    {project.stats.map((stat) => (
                      <div className="project-stat" key={`${project.name}-${stat.label}`}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <ul className="project-details">
                    {project.details.map((detail) => (
                      <li key={`${project.name}-${detail}`}>
                        <i className="bi bi-check2-circle" aria-hidden="true"></i>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <a className="project-cta" href="#contacto">
                    Quiero un proyecto similar
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq-solar" className="faq-section" data-aos="fade-up" data-aos-delay="100">
        <div className="container faq-grid">
          <div className="faq-intro">
            <span className="section-kicker">Preguntas frecuentes</span>
            <h2>Lo importante antes de decidir</h2>
            <p>
              Energia solar no deberia sentirse confusa. Aqui resolvemos las preguntas clave para entender ahorro, proceso y alcance.
            </p>
            <a className="faq-cta" href="#contacto">
              Tengo otra pregunta
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
          <div className="faq-list">
            <details className="faq-item" open>
              <summary>
                <span>Como se si mi proyecto solar es viable?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Revisamos tu factura, horario de consumo, area disponible y condiciones de conexion. Con eso definimos tamano, retorno y alcance tecnico.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span>Cuanto tarda una instalacion fotovoltaica?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Depende del tamano y los permisos. Un sistema residencial suele instalarse en pocos dias despues de la ingenieria y aprobaciones.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span>RedSol tambien hace la legalizacion?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Si. Te acompanamos con diseno, documentacion, instalacion y proceso ante el operador de red correspondiente.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span>El sistema funciona cuando se va la energia?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Un sistema conectado a red normalmente se apaga por seguridad durante cortes. Si necesitas respaldo, se evalua una solucion con baterias o configuracion hibrida.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span>Que mantenimiento necesita?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Recomendamos limpieza periodica, revision electrica y seguimiento de produccion. La frecuencia depende del polvo, sombra y condiciones del lugar.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span>Instalan proyectos residenciales, comerciales e industriales?</span>
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>Si. Dimensionamos cada sistema segun consumo, espacio, tipo de operacion y objetivo de ahorro.</p>
            </details>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact-section" data-aos="fade-up" data-aos-delay="150">
        <div className="container contact-grid">
          <div className="contact-copy">
            <span className="section-kicker">Contacto</span>
            <h2>Cuentanos sobre tu proyecto solar</h2>
            <p>
              Con tu factura o una idea de consumo podemos orientarte mejor. Te respondemos con una ruta clara para cotizar, disenar e instalar.
            </p>
            <a className="contact-whatsapp" href="https://wa.me/573183464183" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-whatsapp" aria-hidden="true"></i>
              Hablar por WhatsApp
            </a>
          </div>

          <form className="contact-form" action="https://formspree.io/f/xwpbbnqv" method="POST">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input type="text" name="nombre" className="form-control" required placeholder=" " />
            </div>
            <div className="mb-3">
              <label className="form-label">Whatsapp</label>
              <input type="text" name="telefono" className="form-control" required placeholder=" " />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input type="email" name="correo" className="form-control" required placeholder=" " />
            </div>
            <div className="mb-3">
              <label className="form-label">Mensaje</label>
              <textarea name="mensaje" className="form-control" rows="4" required placeholder="Cuentanos sobre tu necesidad" />
            </div>
            <button type="submit" className="btn btn-redsol-primary w-100">Enviar solicitud</button>
          </form>
        </div>
      </section>

    <footer className="bg-dark text-white pt-5 pb-3" data-aos="fade-in" data-aos-delay="300">
  <div className="container">
    <div className="row gy-4 align-items-start text-center text-lg-start">

      {/* 1) Marca */}
      <div className="col-12 col-lg-4">
        <div className="footer-brand mb-3">
          <img src="/REDSOL_logo_completo_fondo_blanco.png" alt="RedSol Colombia" />
        </div>

        <p className="text-white-50 mb-3 mx-auto mx-lg-0" style={{ maxWidth: 420 }}>
          Diseñamos, instalamos y te acompañamos en todo el proceso de tu sistema fotovoltaico.
        </p>

        
      </div>

      {/* 2) Enlaces */}
      <div className="col-12 col-md-6 col-lg-4">
        <h6 className="fw-bold mb-3">Explorar</h6>
        <ul className="list-unstyled mb-0">
          <li className="mb-2">
            <a className="text-white-50 text-decoration-none" href="#servicios">Servicios</a>
          </li>
          <li className="mb-2">
            <a className="text-white-50 text-decoration-none" href="#proyectos">Proyectos</a>
          </li>
          <li className="mb-2">
            <a className="text-white-50 text-decoration-none" href="#cotizador-factura">Cotización</a>
          </li>
          <li className="mb-2">
            <a className="text-white-50 text-decoration-none" href="#faq-solar">Preguntas frecuentes</a>
          </li>
        </ul>
      </div>

      {/* 3) Contacto */}
      <div className="col-12 col-md-6 col-lg-4">
        <h6 className="fw-bold mb-3">Contacto</h6>

        <div className="text-white-50">
          <div className="mb-2">
            <span className="text-white fw-semibold">WhatsApp:</span>{" "}
            <a
              className="text-white text-decoration-none"
              href="https://wa.me/573183464183"
              target="_blank"
              rel="noopener noreferrer"
            >
              +57 318 346 4183
            </a>
          </div>

          <div className="mb-3">
            <span className="text-white fw-semibold">Correo:</span>{" "}
            <a className="text-white-50 text-decoration-none" href="mailto:info@redsolcolombia.com">
              info@redsolcolombia.com
            </a>
          </div>

          <div className="d-flex justify-content-center justify-content-lg-start gap-2 flex-wrap">
          <a
            href="https://instagram.com/redsolcolombia"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-light btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            style={{ borderRadius: 12 }}
          >
            {/* Instagram icon (SVG) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            @redsolcolombia
          </a>

          <a
            href="https://wa.me/573183464183"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-sm fw-semibold d-inline-flex align-items-center gap-2"
            style={{ borderRadius: 12 }}
          >
            {/* WhatsApp icon (SVG) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11.5a8.5 8.5 0 0 1-12.8 7.4L4 20l1.2-3.1A8.5 8.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 10.2c.3 2 2.8 4.5 4.8 4.8.4.1.8-.1 1.1-.3l1-.7c.3-.2.6-.2.9 0l1.2.7c.3.2.4.6.2.9-.6 1-1.7 1.5-2.8 1.3-3-.5-6.5-4-7-7-.2-1.1.3-2.2 1.3-2.8.3-.2.7-.1.9.2l.7 1.2c.2.3.2.6 0 .9l-.7 1c-.2.3-.3.7-.3 1.1Z" fill="currentColor" opacity=".9"/>
            </svg>
            +57 318 346 4183
          </a>
        </div>

          <div className="small text-white-50 mt-3">
            Respuesta rápida en horario laboral.
          </div>
        </div>
      </div>

    </div>

    <hr className="border-secondary my-4" />

    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 text-center">
      <small className="text-white-50">
        © {new Date().getFullYear()} Redsol Colombia. Todos los derechos reservados.
      </small>

      <small className="text-white-50">
        Hecho con <span className="text-white">ingeniería</span> y <span className="text-white">transparencia</span>.
      </small>
    </div>
  </div>
</footer>



      <a
        href="https://wa.me/573183464183"
        className="btn btn-success position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
        style={{ width: 60, height: 60, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        target="_blank" rel="noopener noreferrer"
      >
        💬
      </a>
    </main>
  );
}

export default LandingContent;
