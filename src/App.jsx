import './App.css';
import CotizadorFactura from './components/Cotizadorfactura';
import SimuladorConGrafico from './components/SimuladorConGrafico';
import { useEffect, useState } from 'react';
import { auth, login, logout } from "./firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Detectar sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Login con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError("");
      setShowLogin(false); // cerrar modal
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  // Efecto scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('mainNavbar');
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
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* NAVBAR */}
        <nav id="mainNavbar" className="navbar navbar-expand-lg navbar-transparent fixed-top transition-navbar">
          <div className="container py-2">
            <a className="navbar-brand text-primary fw-bold fs-4" href="#">RED SOL</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto gap-3 align-items-center">
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#servicios">Servicios</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#proyectos">Proyectos</a></li>
                <li className="nav-item"><a className="nav-link fw-medium text-secondary link-hover" href="#contacto">Contacto</a></li>
                <li className="nav-item">
                  {user ? (
                    <>
                      <span className="fw-bold text-primary me-2">{user.email}</span>
                      {/* 🔹 Dashboard ahora con Link */}
                      <Link to="/dashboard" className="btn btn-success btn-sm me-2">Dashboard</Link>
                      <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
                    </>
                  ) : (
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setShowLogin(true)}>Login</button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>

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

        <section id="simulador" className="py-5 bg-white" data-aos="fade-up-right" data-aos-delay="100">
          <SimuladorConGrafico />
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
            <h2 className="mb-5 text-center text-primary fw-bold">Proyectos</h2>
            <div id="carouselProyectos" className="carousel slide shadow-sm rounded overflow-hidden" data-bs-ride="carousel">
              <div className="carousel-inner">
                <div className="carousel-item active" data-aos="zoom-in" data-aos-delay="300">
                  <img src="/proyecto1.jpg" className="d-block w-100" alt="Proyecto 1" />
                </div>
                <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                  <img src="/proyecto2.jpg" className="d-block w-100" alt="Proyecto 2" />
                </div>
                <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                  <img src="/proyecto3.jpg" className="d-block w-100" alt="Proyecto 3" />
                </div>
                <div className="carousel-item" data-aos="zoom-in" data-aos-delay="300">
                  <img src="/proyecto5.jpg" className="d-block w-100" alt="Proyecto 5" />
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

        {/* CONTACTO */}
        <section id="contacto" className="py-5 bg-light text-center" data-aos="fade-up" data-aos-delay="150">
          <div className="container">
            <h2 className="mb-5 fw-bold text-primary">Contáctanos</h2>
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
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label>Contraseña</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
