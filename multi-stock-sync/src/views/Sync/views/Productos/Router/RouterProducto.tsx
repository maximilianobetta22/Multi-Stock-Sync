import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "../Views/Home/Home";

function RouterProductos() {

  return (
    <Routes>
      <Route path="/home" element={<Home/> } />
      <Route path="/crear" element={<div>Crear</div>} />

      <Route path="/*" element={<Navigate to="/sync/productos/home"/>}/>
    </Routes>
  );
};

export default RouterProductos;