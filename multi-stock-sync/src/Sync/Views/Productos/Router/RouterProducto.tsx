import { Navigate, Route, Routes } from "react-router-dom";
import CrearProducto from "../Views/Crear/CrearProducto";
import HomeProducto from "../Views/Home/HomeProducto";
import EditarProducto from "../Views/Editar/EditarProducto";

function RouterProductos() {
  return (
    <Routes>
      <Route path="/home" element={<HomeProducto />} />
      <Route path="/crear" element={<CrearProducto />} />
      <Route path="/editar/:id" element={<EditarProducto />} />
      <Route path="/*" element={<Navigate to="/sync/productos/home" />} />
    </Routes>
  );
}

export default RouterProductos;