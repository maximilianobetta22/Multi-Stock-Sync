import { Navigate, Route, Routes } from "react-router-dom";

import LayoutSync from "../Layout/LayoutSync";

import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";
import RouterCompania from "../Views/Compania/Router/RouterCompania";
import RouterConexiones from "../Views/Conexiones/Router/RouterConexiones";

import HomeSync from "../Views/Home/HomeSync";

function RouterSync() {
  return (
    <LayoutSync>
      <Routes>
        <Route path="/conexiones/*" element={<RouterConexiones />} />
        <Route path="/home" element={<HomeSync />} />
        <Route path="/productos/*" element={<RouterProductos />} />
        <Route path="/bodegas/*" element={<RouterBodegas />} />
        <Route path="/companias/*" element={<RouterCompania />} />

        <Route path="/*" element={<Navigate to="/sync/home" />} />
      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;
