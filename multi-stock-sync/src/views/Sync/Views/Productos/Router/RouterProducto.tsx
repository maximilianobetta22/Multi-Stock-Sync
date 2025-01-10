import { Navigate, Route, Routes } from "react-router-dom";

import CrearProducto from "../Views/Crear/CrearProducto";

function RouterProductos() {

  return (
    <Routes>
      <Route path="/home" element={<div>Landing Page</div>} />
      <Route path="/crear" element={<CrearProducto />} />

      <Route path="/*" element={<Navigate to="/sync/productos/home"/>}/>
    </Routes>
  );
};

export default RouterProductos;