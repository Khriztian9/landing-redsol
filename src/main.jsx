import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import CotizadorFactura from './components/Cotizadorfactura';


import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from './components/Dashboard';
import SimuladorConGrafico from './components/SimuladorConGrafico';
import PrivateLayout from './components/PrivateLayout';

AOS.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* PÚBLICO */}
        <Route path="/" element={<App />} />

        {/* PRIVADO */}
        <Route element={<PrivateLayout />}>
          <Route path="/cotizador" element={<CotizadorFactura />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/app" element={<SimuladorConGrafico />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
