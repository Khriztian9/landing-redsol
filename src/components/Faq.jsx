import React, { useState } from 'react';

const questions = [
  {
    q: '¿Cuánto tiempo dura la instalación de un sistema solar?',
    a: 'Dependiendo del tamaño, la instalación puede tardar entre uno y tres días.'
  },
  {
    q: '¿Necesito permisos especiales para instalar paneles?',
    a: 'Nos encargamos de todo el proceso de legalización ante la entidad correspondiente.'
  },
  {
    q: '¿Requieren mucho mantenimiento?',
    a: 'Los sistemas solares requieren poco mantenimiento. Una limpieza anual suele ser suficiente.'
  }
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold text-primary">Preguntas frecuentes</h2>
        {questions.map((item, idx) => (
          <div key={item.q} className="mb-3">
            <button
              className="btn btn-link text-decoration-none fw-semibold faq-question"
              onClick={() => toggle(idx)}
            >
              {item.q}
            </button>
            {openIndex === idx && <p className="mt-2 text-muted">{item.a}</p>}
            <hr />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Faq;
