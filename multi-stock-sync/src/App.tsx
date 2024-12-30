import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './views/admin';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
