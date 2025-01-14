import { Navigate, Route, Routes } from "react-router-dom";

import LayoutSync from "../Layout/LayoutSync";

<<<<<<< HEAD
=======
import HomeSync from "../Views/Home/HomeSync";
>>>>>>> b94d4a4bdffe72127e5601c4726ea5bfdd40191b
import RouterProductos from "../Views/Productos/Router/RouterProducto";
import RouterBodegas from "../Views/Bodegas/Router/RouterBodega";
import LoginMercado from "../Views/LoginMercadoLibre/LoginMercado";


function RouterSync() {
  return (
    <LayoutSync>
      <Routes>
<<<<<<< HEAD
        

=======
        <Route path="/home" element={<HomeSync />} />
>>>>>>> b94d4a4bdffe72127e5601c4726ea5bfdd40191b
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/productos/*" element={<RouterProductos />} />
        <Route path="/bodegas/*" element={<RouterBodegas />} />
        <Route path="/conexiones" element={<div>Conexiones</div>} />
        <Route path="/woocommerce" element={<div>WooCommerce</div>} />
        <Route path="/loginMercadoLibre" element={<LoginMercado />} />

<<<<<<< HEAD

        <Route path="/*" element={<Navigate to="/sync/menu"/>}/>
=======
        <Route path="/*" element={<Navigate to="/sync/home" />} />
>>>>>>> b94d4a4bdffe72127e5601c4726ea5bfdd40191b
      </Routes>
    </LayoutSync>
  );
}

export default RouterSync;
