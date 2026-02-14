import './App.css';
import CotizadorFactura from './components/Cotizadorfactura';
import SimuladorConGrafico from './components/SimuladorConGrafico';
import { useEffect, useState } from 'react';
import { auth, login, logout } from "./firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Detectar sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Si el usuario inició sesión y está en la landing (/), lo llevamos al dashboard
      if (currentUser && location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError("");
      setShowLogin(false); // cerrar modal
      navigate("/dashboard", { replace: true }); // ✅ ir a Base de datos
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/", { replace: true });
    } catch (e) {
      // por si algo falla, igual intentamos volver a landing
      navigate("/", { replace: true });
    }
  };

  // Efecto scroll para navbar (solo aplica para landing público)
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('mainNavbar');
      if (!navbar) return;

      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <a href="#contenido-principal" className="visually-hidden-focusable position-absolute top-0 start-0 m-2 p-2 bg-white text-dark rounded">Saltar al contenido principal</a>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ✅ NAVBAR */}
        <nav
          id="mainNavbar"
          aria-label="Navegación principal"
          className={`navbar navbar-expand-lg fixed-top transition-navbar ${
            user ? "bg-white border-bottom" : "navbar-transparent"
          }`}
        >
          <div className="container py-2">
            <a className="navbar-brand text-primary fw-bold fs-4" href={user ? "/dashboard" : "#"}>
              RED SOL
            </a>

            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto gap-3 align-items-center">

                {/* ✅ Si NO hay sesión: menú landing */}
                {!user && (
                  <>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#cotizador-factura">Cotizador</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#servicios">Servicios</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#proyectos">Proyectos</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#cobertura">Cobertura</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#faq-solar">FAQ</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link fw-medium text-secondary link-hover" href="#contacto">Contacto</a>
                    </li>
                    <li className="nav-item">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setShowLogin(true)}>
                        Login
                      </button>
                    </li>
                  </>
                )}

                {/* ✅ Si HAY sesión: pestañas privadas */}
                {user && (
                  <>
                    <li className="nav-item">
                      <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                          `nav-link fw-medium ${isActive ? "text-primary fw-bold" : "text-secondary"}`
                        }
                      >
                        Base de datos
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink
                        to="/app"
                        className={({ isActive }) =>
                          `nav-link fw-medium ${isActive ? "text-primary fw-bold" : "text-secondary"}`
                        }
                      >
                        App
                      </NavLink>
                    </li>

                    <li className="nav-item d-flex align-items-center">
                      <span className="fw-bold text-primary me-2" style={{ fontSize: 12 }}>
                        {user.email}
                      </span>
                      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </>
                )}

              </ul>
            </div>
          </div>
        </nav>

        {/* ✅ CONTENIDO: Landing solo si NO hay sesión */}
        {!user && (
          <main id="contenido-principal">
            {/* HERO */}
            <header className="hero-section text-white text-center d-flex align-items-center justify-content-center"
              data-aos="fade-down" data-aos-delay="100" data-aos-duration="1000">
              <div className="bg-overlay p-5 rounded">
                <h1 className="display-4 fw-bold">Energía solar a tu alcance</h1>
                <p className="lead">Soluciones fotovoltaicas integrales en Colombia</p>
                <a href="#contacto" className="btn btn-outline-light btn-lg mt-3">Solicita una cotización</a>
              </div>
            </header>

            {/* VIDEO */}
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

            {/* COMPONENTES */}
            <section id="cotizador-factura" className="py-5 bg-white" data-aos="fade-up-right" data-aos-delay="100">
              <CotizadorFactura />
            </section>


            {/* SERVICIOS */}
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

            {/* PROYECTOS */}
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


            {/* COBERTURA LOCAL */}
            <section id="cobertura" className="py-5 bg-light" data-aos="fade-up" data-aos-delay="120">
              <div className="container">
                <h2 className="text-center fw-bold text-primary mb-3">Cobertura en el Eje Cafetero</h2>
                <p className="text-center text-muted mb-4">
                  Atendemos proyectos de energía solar residencial, comercial e industrial en Pereira, Manizales, Armenia y municipios cercanos.
                </p>
                <div className="row g-3 justify-content-center">
                  <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">Pereira</div></div>
                  <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">Manizales</div></div>
                  <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">Armenia</div></div>
                  <div className="col-md-3 col-6"><div className="border rounded p-3 text-center bg-white">Dosquebradas</div></div>
                </div>
              </div>
            </section>

            {/* FAQ SEO */}
            <section id="faq-solar" className="py-5 bg-white" data-aos="fade-up" data-aos-delay="100">
              <div className="container" style={{ maxWidth: 900 }}>
                <h2 className="text-center fw-bold text-primary mb-4">Preguntas frecuentes sobre energía solar en el Eje Cafetero</h2>
                <div className="mb-3">
                  <h3 className="h5 fw-semibold">¿En qué ciudades instalan paneles solares?</h3>
                  <p className="text-muted mb-0">Instalamos en Pereira, Manizales, Armenia y municipios cercanos del Eje Cafetero.</p>
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
            {/* CONTACTO */}
            <section id="contacto" className="py-5 bg-light text-center" data-aos="fade-up" data-aos-delay="150">
              <div className="container">
                <h2 className="mb-5 fw-bold text-primary">Contáctanos para tu proyecto solar en el Eje Cafetero</h2>
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

            {/* FOOTER */}
            <footer className="text-center py-4 bg-dark text-white" data-aos="fade-in" data-aos-delay="300">
              © {new Date().getFullYear()} Red Sol Colombia. Todos los derechos reservados.
            </footer>

            {/* BOTÓN WHATSAPP */}
            <a
              href="https://wa.me/573183464183"
              className="btn btn-success position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
              style={{ width: 60, height: 60, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
              target="_blank" rel="noopener noreferrer"
            >
              💬
            </a>
          </main>
        )}

        {/* ✅ SI HAY SESIÓN: aquí NO renderizamos landing (porque entrarás por rutas /dashboard o /app) */}
        {user && (
          <div style={{ paddingTop: 90 }} className="container">
            {/* Mensaje opcional para que no quede "vacío" si el usuario entra a "/" logueado */}
            <div className="alert alert-info">
              Sesión activa. Ve a <Link to="/dashboard">Base de datos</Link> o <Link to="/app">App</Link>.
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE LOGIN */}
      {showLogin && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h5 className="mb-3">Iniciar Sesión</h5>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">Ingresar</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLogin(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
