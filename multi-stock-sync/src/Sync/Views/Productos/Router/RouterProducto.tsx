import { Route, Routes } from "react-router-dom";
import GestionProducto from "../Views/GestionProducto";
import CrearProducto from "../Views/components/CrearProducto"; // ✅ corregido
import CargaMasiva from "../Views/CargaMasiva"; // ✅ corregido

const RouterProducto = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionProducto />} />
      <Route path="/crear" element={<CrearProducto />} />
      <Route path="/carga-masiva" element={<CargaMasiva />} />
    </Routes>
  );
};

export default RouterProducto;
