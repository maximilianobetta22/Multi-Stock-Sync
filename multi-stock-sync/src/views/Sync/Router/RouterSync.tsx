import { Navigate, Route, Routes } from "react-router-dom";
import LayoutSync from "../Layout/LayoutSync";

import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";


function RouterSync() {
  
  return (
    <LayoutSync>
      <Routes>
        

        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos/*" element={<RouterProductos/>} />
        <Route path="/bodegas/*" element={<RouterBodegas/>} />
        <Route path="/conexiones" element={<div>Conexiones</div>} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />


        <Route path="/*" element={<Navigate to="/sync/menu"/>}/>
      </Routes>
    </LayoutSync>
  );
};
  
export default RouterSync;