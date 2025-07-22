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
import GestionEnvios from "../Views/GestionEnvios/GestionEnvios";
import RouterGestionEnvio from "../Views/GestionEnvios/Router/RouterGestionEnvio";
import RouterPuntodeVenta from "../Views/PuntoVenta/Router/RouterPuntodeVenta";
import RouterPerfil from "../Views/Perfil/Router/RouterPerfil";
import RouterConfiguracion from "../Views/Configuracion/Router/RouterConfiguracion";
import RouterGestionUsuarios from "../Views/GestionUsuarios/Router/RouterGestionUsuarios";
import Pagina404 from "../Views/Error/Pagina404";
import PrivateRoute from "../../Auth/PrivateRoute";
import RoleRoute from "../../RoutesProtection/RoleRoute";
import AccesoDenegado from "../../RoutesProtection/AccesoDenegado";
import PublicRoute from "../../Auth/PublicRoute";
import VerificationPage from "../../Auth/Pages/VerificationPage";
import VerifiedRoute from "../../Auth/VerifiedRoute";


function RouterSync() {
  return (
    <LayoutSync>
      <Routes>
        {/*  Página de verificación (siempre accesible si está logueado) */}
        <Route path="/verify-email" element={
          <PrivateRoute>
            <VerificationPage />
          </PrivateRoute>
        } />

        <Route path="/home" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <HomeSync />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/seleccionar-conexion" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <SeleccionConexion />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/info" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={false}>
              <Info />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/perfil/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RouterPerfil />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/conexiones/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <RouterConexiones />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/productos/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 5, 7]}> 
                <RouterProductos />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/companias/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <RouterCompania />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/bodegas/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 6, 7, 5]}> 
                <RouterBodegas />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/reportes/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <RouterReportes />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/envios" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <GestionEnvios />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/punto-de-venta/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <RouterPuntodeVenta />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/configuracion/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RouterConfiguracion />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/envios/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RouterGestionEnvio />
            </VerifiedRoute>
          </PrivateRoute>
        } />

        <Route path="/Gestion-usuarios/*" element={
          <PrivateRoute>
            <VerifiedRoute requireVerification={true}>
              <RoleRoute allowedRoleIds={[1, 4, 7]}> 
                <RouterGestionUsuarios />
              </RoleRoute>
            </VerifiedRoute>
          </PrivateRoute>
        } />

        {/* 🔵 RUTAS PÚBLICAS */}
        <Route path="/landing" element={<LandingPage />} />

        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/logout" element={<Logout />} />
        <Route path="/about" element={<About />} />

        {/* 🔴 RUTAS DE ERROR */}
        <Route path="/" element={<Navigate to="/sync/landing" />} />
        <Route path="/403" element={<PrivateRoute><AccesoDenegado /></PrivateRoute>} />
        <Route path="*" element={<Pagina404 />} />
      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;