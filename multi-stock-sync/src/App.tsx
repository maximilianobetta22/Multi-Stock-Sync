import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';
import Despacho from './views/PuntoVenta/Despacho/Despacho';
import Reimprimir from './views/PuntoVenta/Reimprimir/Reimprimir';
import AbonoCliente from './views/PuntoVenta/AbonoCliente/AbonoCliente';
import MovimientosEfectivo from './views/PuntoVenta/MovimientosEfectivo/MovimientosEfectivo';
import Devolucion from './views/PuntoVenta/Devolucion/Devolucion';
import CierreCaja from './views/PuntoVenta/CierreCaja/CierreCaja';
import Maestros from './views/PuntoVenta/Maestros/Maestros';
import RecepcionStock from './views/PuntoVenta/RecepcionStock/RecepcionStock';
import Reportes from './views/PuntoVenta/Reportes/Reportes';

import Documentos from './views/Admin/Documentos/Documentos';
import ProductosServicios from './views/Admin/ProductosServicios/Listar/ProductosServicios';
import CrearProducto from './views/Admin/ProductosServicios/Crear/Producto/CrearProducto';
import CrearServicio from './views/Admin/ProductosServicios/Crear/Servicio/CrearServicio';
import CrearPackPromocion from './views/Admin/ProductosServicios/Crear/Pack-Promocion/CrearPackPromocion';
import AdminReportes from './views/Admin/Reportes/Reportes';
import Stock from './views/Admin/Stock/Stock';

import EditarPackPromocion from './views/Admin/ProductosServicios/Editar/Pack-Promocion/EditarPackPromocion';
import EditarProducto from './views/Admin/ProductosServicios/Editar/Producto/EditarProducto';
import EditarServicio from './views/Admin/ProductosServicios/Editar/Servicio/EditarServicio';

import Login from './views/Auth/Login/Login';
import Register from './views/Auth/Register/Register';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<InitialPage />} />
      <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
      <Route path="/punto-venta/despacho" element={<Despacho />} />
      <Route path="/punto-venta/reimprimir" element={<Reimprimir />} />
      <Route path="/punto-venta/abono-cliente" element={<AbonoCliente />} />
      <Route path="/punto-venta/devolucion" element={<Devolucion />} />
      <Route path="/punto-venta/movimientos-efectivo" element={<MovimientosEfectivo />} />
      <Route path="/punto-venta/cierre-caja" element={<CierreCaja />} />
      <Route path="/punto-venta/reportes" element={<Reportes />} />
      <Route path="/punto-venta/maestros" element={<Maestros />} />
      <Route path="/punto-venta/recepcion-stock" element={<RecepcionStock />} />
      <Route path="/admin/documentos" element={<Documentos />} />
      <Route path="/admin/productos-servicios" element={<ProductosServicios />} />
      <Route path="/admin/productos-servicios/crear/producto" element={<CrearProducto />} />
      <Route path="/admin/productos-servicios/crear/servicio" element={<CrearServicio />} />
      <Route path="/admin/productos-servicios/crear/pack-promocion" element={<CrearPackPromocion />} />
      <Route path="/admin/productos-servicios/editar/pack-promocion/:id" element={<EditarPackPromocion />} />
      <Route path="/admin/productos-servicios/editar/producto/:id" element={<EditarProducto />} />
      <Route path="/admin/productos-servicios/editar/servicio/:id" element={<EditarServicio />} />
      <Route path="/admin/reportes" element={<AdminReportes />} />
      <Route path="/admin/stock" element={<Stock />} />
    </Routes>
  </Router>

  );
}

export default App;
