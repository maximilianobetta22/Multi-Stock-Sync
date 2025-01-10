import { Navigate, Route, Routes } from "react-router-dom";
import LayoutSync from "../Layout/LayoutSync";
import Index from "../Views/Index";

function RouterSync() {
  
  return (
    <LayoutSync>
      <Routes>
        
        <Route path="/menu" element={<Index/>} />
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos" element={<div>Productos</div>} />
        <Route path="/conexiones" element={<div>Conexiones</div>} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />


        <Route path="/*" element={<Navigate to="/sync/menu"/>}/>
      </Routes>
    </LayoutSync>
  );
};
  
export default RouterSync;