import { Navigate, Route, Routes } from "react-router-dom";

import LayoutSync from "../Layout/LayoutSync";


import HomeSync from "../Views/Home/HomeSync";

import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";
import LoginMercado from "../Views/LoginMercadoLibre/LoginMercado";
function RouterSync() {
  return (
    <LayoutSync>
      <Routes>

        


        <Route path="/home" element={<HomeSync />} />
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos/*" element={<RouterProductos />} />
        <Route path="/bodegas/*" element={<RouterBodegas />} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />
        <Route path="/loginMercadoLibre" element={<LoginMercado />} />
        <Route path="/*" element={<Navigate to="/sync/menu"/>}/>
        <Route path="/*" element={<Navigate to="/sync/home" />} />

      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;
