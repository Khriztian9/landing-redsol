import React from 'react';

const features = [
  { icon: 'bi-sun', title: 'Energía limpia', text: 'Aprovecha la radiación solar para generar tu propia electricidad.' },
  { icon: 'bi-clock-history', title: 'Ahorro a largo plazo', text: 'Reduce tus facturas de energía y protege tu negocio de los aumentos de precio.' },
  { icon: 'bi-globe2', title: 'Sostenibilidad', text: 'Contribuye a la reducción de CO2 y al cuidado del planeta.' }
];

function Features() {
  return (
    <section id="caracteristicas" className="py-5 bg-white text-center">
      <div className="container">
        <h2 className="mb-5 text-primary fw-bold">¿Por qué elegirnos?</h2>
        <div className="row g-4">
          {features.map((f) => (
            <div key={f.title} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body py-5">
                  <i className={`bi ${f.icon} fs-1 text-primary mb-3`}></i>
                  <h5 className="card-title fw-semibold mb-2">{f.title}</h5>
                  <p className="text-muted">{f.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
