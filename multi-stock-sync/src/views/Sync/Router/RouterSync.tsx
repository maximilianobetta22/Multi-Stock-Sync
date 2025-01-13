import { Navigate, Route, Routes } from "react-router-dom";
import LayoutSync from "../Layout/LayoutSync";
import RouterProductos from "../Views/Productos/Router/RouterProducto";

function RouterSync() {
  
  return (
    <LayoutSync>
      <Routes>
        
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos/*" element={<RouterProductos/>} />
        <Route path="/conexiones" element={<div>Conexiones</div>} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />

        <Route path="/*" element={<Navigate to="/sync/perfil"/>}/>
      </Routes>
    </LayoutSync>
  );
};
  
export default RouterSync;