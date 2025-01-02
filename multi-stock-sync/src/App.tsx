import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';
import Despacho from './views/PuntoVenta/Despacho/Despacho';
import Reimprimir from './views/PuntoVenta/Reimprimir/Reimprimir';
import AbonoCliente from './views/PuntoVenta/AbonoCliente/AbonoCliente';
import MovimientosEfectivo from './views/PuntoVenta/MovimientosEfectivo/MovimientosEfectivo';

import Devolucion from './views/PuntoVenta/Devolucion/Devolucion';

import Documentos from './views/Admin/Documentos/Documentos';

import ProductosServicios from './views/Admin/ProductosServicios/ProductosServicios';


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
      <Route path="/punto-venta/devolucion" element={<Devolucion />} />
      <Route path="/punto-venta/movimientos-efectivo" element={<MovimientosEfectivo />} />
      <Route path="/admin/documentos" element={<Documentos />} />
      <Route path="/admin/productos-servicios" element={<ProductosServicios />} />
    </Routes>
  </Router>

  );
}

export default App;
