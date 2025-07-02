import { Navigate, Route, Routes } from "react-router-dom";
import LayoutSync from "../Layout/LayoutSync";
import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";
import RouterConexiones from "../Views/Conexiones/Router/RouterConexiones";
import RouterReportes from "../Views/Reportes/Router/RouterReportes";
import RouterCompania from "../Views/Compania/Router/RouterCompania";
import Info from "../Views/Info/Info";
import HomeSync from "../Views/Home/HomeSync";
import LandingPage from "../Views/Home/LandingPage";
import About from "../Views/About/About";
import { Login } from "../../Auth/Pages";
import Register from "../../Auth/Pages/Register";
import Logout from "../../Auth/Pages/Logout";
import SeleccionConexion from "../Views/SeleccionConexion/SeleccionConexion";
import GestionEnvios from "../Views/GestionEnvios/GestionEnvios"; // ✅ Nuevo
import RouterGestionEnvio from "../Views/GestionEnvios/Router/RouterGestionEnvio";
import RouterPuntodeVenta from "../Views/PuntoVenta/Router/RouterPuntodeVenta"
import RouterPerfil from "../Views/Perfil/Router/RouterPerfil";
import RouterConfiguracion from "../Views/Configuracion/Router/RouterConfiguracion";
import RouterGestionUsuarios from "../Views/GestionUsuarios/Router/RouterGestionUsuarios";
import Pagina404 from "../Views/Error/Pagina404";
import PrivateRoute from "../../Auth/PrivateRoute";

 // ✅ Nuevo from "../Views/GestionVentas/Router/RouterGestionVentas";

function RouterSync() {
  return (
    <LayoutSync>
      <Routes>
 <Route path="/conexiones/*" element={
  <PrivateRoute>
    <RouterConexiones />
  </PrivateRoute>
} />

<Route path="/home" element={
  <PrivateRoute>
    <HomeSync />
  </PrivateRoute>
} />

<Route path="/landing" element={<LandingPage />} />

<Route path="/productos/*" element={
  <PrivateRoute>
    <RouterProductos />
  </PrivateRoute>
} />

<Route path="/companias/*" element={
  <PrivateRoute>
    <RouterCompania />
  </PrivateRoute>
} />

<Route path="/bodegas/*" element={
  <PrivateRoute>
    <RouterBodegas />
  </PrivateRoute>
} />

<Route path="/reportes/*" element={
  <PrivateRoute>
    <RouterReportes />
  </PrivateRoute>
} />

<Route path="/info" element={
  <PrivateRoute>
    <Info />
  </PrivateRoute>
} />

<Route path="/envios" element={
  <PrivateRoute>
    <GestionEnvios />
  </PrivateRoute>
} />

<Route path="/punto-de-venta/*" element={
  <PrivateRoute>
    <RouterPuntodeVenta />
  </PrivateRoute>
} />

<Route path="/perfil/*" element={
  <PrivateRoute>
    <RouterPerfil />
  </PrivateRoute>
} />

<Route path="/configuracion/*" element={
  <PrivateRoute>
    <RouterConfiguracion />
  </PrivateRoute>
} />

<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/logout" element={<Logout />} />

<Route path="/about" element={<About />} />

<Route path="/seleccionar-conexion" element={
  <PrivateRoute>
    <SeleccionConexion />
  </PrivateRoute>
} />

<Route path="/envios/*" element={
  <PrivateRoute>
    <RouterGestionEnvio />
  </PrivateRoute>
} />

<Route path="/Gestion-usuarios/*" element={
  <PrivateRoute>
    <RouterGestionUsuarios />
  </PrivateRoute>
} />
<Route path="/" element={<Navigate to="/sync/landing" />} />

        <Route path="*" element={<Pagina404 />} />
      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;
