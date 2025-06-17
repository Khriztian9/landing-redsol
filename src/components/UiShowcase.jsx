import React, { useEffect, useState } from 'react';

function UiShowcase() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((t) => new window.bootstrap.Tooltip(t));

    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach((p) => new window.bootstrap.Popover(p));

    const toastEl = document.getElementById('demoToast');
    if (toastEl) {
      const toast = new window.bootstrap.Toast(toastEl);
      const btn = document.getElementById('showToastBtn');
      btn.addEventListener('click', () => toast.show());
    }

    const spyEl = document.getElementById('scrollspySection');
    if (spyEl) {
      new window.bootstrap.ScrollSpy(spyEl, { target: '#scrollspyNav' });
    }
  }, []);

  return (
    <section id="extras" className="py-5 bg-white">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold text-primary">Componentes Bootstrap</h2>

        {/* Alert */}
        {showAlert && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            Ejemplo de alerta!
            <button type="button" className="btn-close" onClick={() => setShowAlert(false)}></button>
          </div>
        )}
        <button className="btn btn-warning mb-4" onClick={() => setShowAlert(true)}>Mostrar alerta</button>

        {/* Badge */}
        <h4 className="mb-4">
          Notificaciones <span className="badge bg-success">4</span>
        </h4>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#">Inicio</a></li>
            <li className="breadcrumb-item active" aria-current="page">Ejemplo</li>
          </ol>
        </nav>

        {/* Buttons & Button group */}
        <div className="mb-4">
          <button className="btn btn-primary me-2">Botón primario</button>
          <button className="btn btn-secondary me-2">Botón secundario</button>
          <div className="btn-group ms-3" role="group">
            <button className="btn btn-outline-primary">1</button>
            <button className="btn btn-outline-primary">2</button>
            <button className="btn btn-outline-primary">3</button>
          </div>
        </div>

        {/* Card */}
        <div className="card mb-4" style={{ maxWidth: 300 }}>
          <img src="/solar-bg.jpg" className="card-img-top" alt="Ejemplo" />
          <div className="card-body">
            <h5 className="card-title">Tarjeta</h5>
            <p className="card-text">Breve descripción de la tarjeta.</p>
            <a href="#" className="btn btn-primary">Acción</a>
          </div>
        </div>

        {/* Carousel */}
        <div id="demoCarousel" className="carousel slide mb-4" data-bs-ride="carousel" style={{ maxWidth: 300 }}>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/proyecto1.jpg" className="d-block w-100" alt="1" />
            </div>
            <div className="carousel-item">
              <img src="/proyecto2.jpg" className="d-block w-100" alt="2" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#demoCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#demoCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>

        {/* Close button */}
        <button className="btn-close mb-4" aria-label="Close"></button>

        {/* Collapse */}
        <p>
          <a className="btn btn-secondary" data-bs-toggle="collapse" href="#demoCollapse" role="button">
            Alternar contenido
          </a>
        </p>
        <div className="collapse mb-4" id="demoCollapse">
          <div className="card card-body">Texto colapsable.</div>
        </div>

        {/* Dropdown */}
        <div className="dropdown mb-4">
          <button className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
            Menú desplegable
          </button>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">Acción</a></li>
            <li><a className="dropdown-item" href="#">Otra acción</a></li>
          </ul>
        </div>

        {/* List group */}
        <ul className="list-group mb-4" style={{ maxWidth: 300 }}>
          <li className="list-group-item active">Elemento 1</li>
          <li className="list-group-item">Elemento 2</li>
          <li className="list-group-item">Elemento 3</li>
        </ul>

        {/* Modal */}
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#demoModal">
          Abrir modal
        </button>
        <div className="modal fade" id="demoModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Título modal</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">Este es el contenido del modal.</div>
            </div>
          </div>
        </div>

        {/* Navs & Tabs */}
        <ul className="nav nav-tabs mt-5" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab">Inicio</button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab">Perfil</button>
          </li>
        </ul>
        <div className="tab-content p-3 border border-top-0 mb-4" id="myTabContent">
          <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel">Contenido de inicio.</div>
          <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel">Contenido de perfil.</div>
        </div>

        {/* Offcanvas */}
        <button className="btn btn-primary mb-4" data-bs-toggle="offcanvas" data-bs-target="#demoOffcanvas">
          Abrir offcanvas
        </button>
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="demoOffcanvas">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Menú</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            Contenido del offcanvas.
          </div>
        </div>

        {/* Pagination */}
        <nav aria-label="Ejemplo de paginación" className="my-4">
          <ul className="pagination">
            <li className="page-item"><a className="page-link" href="#">Anterior</a></li>
            <li className="page-item active"><a className="page-link" href="#">1</a></li>
            <li className="page-item"><a className="page-link" href="#">2</a></li>
            <li className="page-item"><a className="page-link" href="#">Siguiente</a></li>
          </ul>
        </nav>

        {/* Placeholders */}
        <div className="card mb-4" style={{ maxWidth: 300 }} aria-hidden="true">
          <img src="/solar-bg.jpg" className="card-img-top" alt="" />
          <div className="card-body">
            <h5 className="card-title placeholder-glow">
              <span className="placeholder col-6"></span>
            </h5>
            <p className="card-text placeholder-glow">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-6"></span>
              <span className="placeholder col-8"></span>
            </p>
            <a className="btn btn-primary disabled placeholder col-6" aria-disabled="true"></a>
          </div>
        </div>

        {/* Popovers & Tooltips */}
        <button type="button" className="btn btn-secondary me-3" data-bs-toggle="popover" data-bs-content="Texto del popover">
          Popover
        </button>
        <button type="button" className="btn btn-secondary me-3" data-bs-toggle="tooltip" title="Texto del tooltip">
          Tooltip
        </button>

        {/* Progress */}
        <div className="progress my-4" style={{ maxWidth: 300 }}>
          <div className="progress-bar" role="progressbar" style={{ width: '60%' }}></div>
        </div>

        {/* Spinners */}
        <div className="spinner-border text-primary mb-4" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>

        {/* Toasts */}
        <div className="mt-4">
          <button className="btn btn-primary" id="showToastBtn">
            Mostrar toast
          </button>
          <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div id="demoToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
              <div className="toast-header">
                <strong className="me-auto">Notificación</strong>
                <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
              </div>
              <div className="toast-body">Hola, esto es un toast.</div>
            </div>
          </div>
        </div>

        {/* Scrollspy */}
        <div id="scrollspyNav" className="mt-5 mb-3">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a className="nav-link active" href="#item-1">Item 1</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#item-2">Item 2</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#item-3">Item 3</a>
            </li>
          </ul>
        </div>
        <div id="scrollspySection" data-bs-spy="scroll" data-bs-target="#scrollspyNav" data-bs-offset="0" className="scrollspy-example" tabIndex="0" style={{ position: 'relative', height: '200px', overflow: 'auto' }}>
          <h4 id="item-1">Item 1</h4>
          <p>Contenido 1...</p>
          <h4 id="item-2">Item 2</h4>
          <p>Contenido 2...</p>
          <h4 id="item-3">Item 3</h4>
          <p>Contenido 3...</p>
        </div>
      </div>
    </section>
  );
}

export default UiShowcase;
