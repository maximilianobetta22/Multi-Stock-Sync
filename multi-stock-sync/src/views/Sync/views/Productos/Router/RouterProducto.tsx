import { Navigate, Route, Routes } from "react-router-dom";

function RouterProductos() {

  return (
    <Routes>
      <Route path="/home" element={<div>Landing Page</div>} />
      <Route path="/crear" element={<div>Crear</div>} />

      <Route path="/*" element={<Navigate to="/sync/productos/home"/>}/>
    </Routes>
  );
};

export default RouterProductos;