import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import './index.css';

const CotizadorFactura = lazy(() => import('./components/Cotizadorfactura'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SimuladorConGrafico = lazy(() => import('./components/SimuladorConGrafico'));
const PrivateLayout = lazy(() => import('./components/PrivateLayout'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={
        <div className="route-loading" role="status">
          <span className="spinner-border" aria-hidden="true" />
          Cargando tu espacio REDSOLAR…
        </div>
      }>
        <Routes>
          <Route path="/" element={<App />} />
          <Route element={<PrivateLayout />}>
            <Route path="/cotizador" element={<CotizadorFactura />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/app" element={<SimuladorConGrafico />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
