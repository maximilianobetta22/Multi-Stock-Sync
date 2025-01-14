import { Navigate, Route, Routes } from "react-router-dom";

import LayoutSync from "../Layout/LayoutSync";
import LoginMercado from "../Views/LoginMercadoLibre/LoginMercado";
import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";
import RouterPerfil from "../Views/Perfil/Router/RouterPerfil";

function RouterSync() {
  return (
    <LayoutSync>
      <Routes>
        
        <Route path="/perfil/*" element={<RouterPerfil />} />
        <Route path="/productos/*" element={<RouterProductos />} />
        <Route path="/bodegas/*" element={<RouterBodegas />} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />
        <Route path="/loginMercadoLibre" element={<LoginMercado />} />

        <Route path="/*" element={<Navigate to="/sync/home" />} />
      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;
