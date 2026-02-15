import CotizadorFactura from './Cotizadorfactura';

function LandingContent() {
  return (
    <main id="contenido-principal">
      <header className="hero-section text-white text-center d-flex align-items-center justify-content-center"
        data-aos="fade-down" data-aos-delay="100" data-aos-duration="1000">
        <div className="bg-overlay p-5 rounded">
          <h1 className="display-4 fw-bold">Energía solar a tu alcance</h1>
          <p className="lead">Soluciones fotovoltaicas integrales en Colombia</p>
          <a href="#cotizador-factura" className="btn btn-outline-light btn-lg mt-3">Solicita una cotización</a>
        </div>
      </header>

      <section className="video-section text-center" data-aos="fade-right" data-aos-delay="200">
        <div className="video-container">
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
      </section>

      <section id="cotizador-factura" className="py-5 bg-white" data-aos="fade-up-right" data-aos-delay="100">
        <CotizadorFactura />
      </section>

      <section id="servicios" className="py-5 bg-light text-center" data-aos="flip-left" data-aos-delay="100">
        <div className="container">
          <h2 className="mb-5 fw-bold text-primary">Servicios</h2>
          <div className="row g-4">
            <div className="col-md-4" data-aos="zoom-in" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm service-card">
                <div className="card-body py-5">
                  <i className="bi bi-diagram-3 fs-1 text-primary mb-3"></i>
                  <h5 className="card-title fw-semibold mb-2">Diseño solar</h5>
                  <p className="text-muted">Estudios y dimensionamiento profesional para cada tipo de usuario.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="zoom-in" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm service-card">
                <div className="card-body py-5">
                  <i className="bi bi-file-earmark-check fs-1 text-primary mb-3"></i>
                  <h5 className="card-title fw-semibold mb-2">Legalización</h5>
                  <p className="text-muted">Asesoría completa ante UPME, CREG y operadores de red de todo el país.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="zoom-in" data-aos-delay="400">
              <div className="card h-100 border-0 shadow-sm service-card">
                <div className="card-body py-5">
                  <i className="bi bi-tools fs-1 text-primary mb-3"></i>
                  <h5 className="card-title fw-semibold mb-2">Instalación</h5>
                  <p className="text-muted">Montaje y puesta en marcha de sistemas solares de cualquier escala.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="proyectos" className="py-5 bg-white" data-aos="slide-up" data-aos-delay="100">
        <div className="container">
          <h2 className="mb-5 text-center text-primary fw-bold">Proyectos de energía solar</h2>
          <div id="carouselProyectos" className="carousel slide shadow-sm rounded overflow-hidden" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active" data-aos="zoom-in" data-aos-delay="300">
                <img src="/proyecto1.jpg" className="d-block w-100" alt="Instalación de paneles solares proyecto 1 en Colombia" loading="lazy" />
              </div>
              <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                <img src="/proyecto2.jpg" className="d-block w-100" alt="Sistema fotovoltaico residencial proyecto 2" loading="lazy" />
              </div>
              <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                <img src="/proyecto3.jpg" className="d-block w-100" alt="Proyecto solar comercial 3 de Red Sol" loading="lazy" />
              </div>
              <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                <img src="/proyecto5.jpg" className="d-block w-100" alt="Montaje de inversores y paneles proyecto 5" loading="lazy" />
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselProyectos" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselProyectos" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </section>

      <section id="cobertura" className="py-5 bg-light" data-aos="fade-up" data-aos-delay="120">
        <div className="container">
          <h2 className="text-center fw-bold text-primary mb-3">Cobertura </h2>
          <p className="text-center text-muted mb-4">
            Atendemos proyectos de energía solar residencial, comercial e industrial en Risaralda, Caldas, Quindio y el norte del Valle.
          </p>
          <div className="row g-3 justify-content-center">
            <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">RISARALDA</div></div>
            <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">CALDAS</div></div>
            <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">QUINDIO</div></div>
            <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">VALLE</div></div>
          </div>
        </div>
      </section>

      <section id="faq-solar" className="py-5 bg-white" data-aos="fade-up" data-aos-delay="100">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="text-center fw-bold text-primary mb-4">Preguntas frecuentes sobre energía solar </h2>
          <div className="mb-3">
            <h3 className="h5 fw-semibold">¿En qué ciudades instalan paneles solares?</h3>
            <p className="text-muted mb-0">Instalamos en Pereira, Manizales, Armenia y municipios cercanos.</p>
          </div>
          <div className="mb-3">
            <h3 className="h5 fw-semibold">¿Cuánto tarda una instalación fotovoltaica?</h3>
            <p className="text-muted mb-0">Según el tamaño del proyecto, una instalación residencial suele completarse en pocos días tras la ingeniería y aprobaciones.</p>
          </div>
          <div>
            <h3 className="h5 fw-semibold">¿También apoyan la legalización del sistema solar?</h3>
            <p className="text-muted mb-0">Sí. Te acompañamos con el proceso de diseño, instalación y legalización ante el operador de red correspondiente.</p>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-5 bg-light text-center" data-aos="fade-up" data-aos-delay="150">
        <div className="container">
          <h2 className="mb-5 fw-bold text-primary">Contáctanos para tu proyecto solar</h2>
          <form className="mx-auto text-start" style={{ maxWidth: 500 }} action="https://formspree.io/f/xwpbbnqv" method="POST">
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
              <textarea name="mensaje" className="form-control" rows="4" required placeholder="Cuéntanos sobre tu necesidad" />
            </div>
            <button type="submit" className="btn btn-primary w-100">Enviar</button>
          </form>
        </div>
      </section>

    <footer className="bg-dark text-white pt-5 pb-3" data-aos="fade-in" data-aos-delay="300">
  <div className="container">
    <div className="row gy-4 align-items-start text-center text-lg-start">

      {/* 1) Marca */}
      <div className="col-12 col-lg-4">
        <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-start gap-3 mb-2">
          {/* Mini “logo” */}
          <div
            className="d-inline-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(13,110,253,.15)",
              border: "1px solid rgba(13,110,253,.35)",
              letterSpacing: 1
            }}
          >
            RS
          </div>

          <div>
            <h5 className="fw-bold mb-1">Redsol Colombia</h5>
            <div className="text-white-50 small">
              Energía solar • Ingeniería • Seguridad
            </div>
          </div>
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
