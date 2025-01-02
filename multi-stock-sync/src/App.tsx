import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';
import Despacho from './views/PuntoVenta/Despacho/Despacho';
import Reimprimir from './views/PuntoVenta/Reimprimir/Reimprimir';
import AbonoCliente from './views/PuntoVenta/AbonoCliente/AbonoCliente';

import DocumentosDashboard from './views/Documentos/Dashboard/DocumentosDashboard';

import Login from './views/Login/Login';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<InitialPage />} />
      <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
      <Route path="/punto-venta/despacho" element={<Despacho />} />
      <Route path="/punto-venta/reimprimir" element={<Reimprimir />} />
      <Route path="/punto-venta/abono-cliente" element={<AbonoCliente />} />
      <Route path="/documentos" element={<DocumentosDashboard />} />
    </Routes>
  </Router>

  );
}

export default App;
