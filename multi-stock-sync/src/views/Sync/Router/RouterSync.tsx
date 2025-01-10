import { Navigate, Route, Routes } from "react-router-dom";
import LayoutSync from "../Layout/LayoutSync";

function RouterSync() {
  
  return (
    <LayoutSync>
      <Routes>
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos" element={<div>Productos</div>} />
        <Route path="/conexiones" element={<div>Conexiones</div>} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />

        <Route path="/*" element={<Navigate to="/sync/perfil"/>}/>
      </Routes>
    </LayoutSync>
  );
};
  
export default RouterSync;