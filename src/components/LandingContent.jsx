import CotizadorFactura from './Cotizadorfactura';

function LandingContent() {
  return (
    <main id="contenido-principal">
      <header className="hero-section text-white text-center d-flex align-items-center justify-content-center"
        data-aos="fade-down" data-aos-delay="100" data-aos-duration="1000">
        <div className="bg-overlay p-5 rounded">
          <h1 className="display-4 fw-bold">Energía solar a tu alcance</h1>
          <p className="lead">Soluciones fotovoltaicas integrales en Colombia</p>
          <a href="#contacto" className="btn btn-outline-light btn-lg mt-3">Solicita una cotización</a>
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

      <footer className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #0b1f4d 0%, #0d6efd 100%)' }} data-aos="fade-in" data-aos-delay="300">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <h3 className="h4 fw-bold mb-2">REDSOL COLOMBIA</h3>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Soluciones fotovoltaicas para hogares, comercios e industria.
              </p>
            </div>

            <div className="col-md-6">
              <div className="d-flex flex-column gap-2 align-items-center align-items-md-end">
                <a
                  href="https://www.instagram.com/redsolcolombia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none fw-semibold"
                >
                  <i className="bi bi-instagram me-2"></i>@redsolcolombia
                </a>
                <a
                  href="https://wa.me/573183464183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none fw-semibold"
                >
                  <i className="bi bi-whatsapp me-2"></i>WhatsApp: +57 318 346 4183
                </a>
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.35)' }} />
          <p className="text-center mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>
            © {new Date().getFullYear()} Redsol Colombia. Todos los derechos reservados.
          </p>
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
