import { Navigate, Route, Routes } from "react-router-dom";

import HomeBodega from "../Views/Home/HomeBodega";

function RouterBodegas() {
  return (
    <Routes>
      <Route path="/home" element={<HomeBodega />} />
      <Route path="/editar/:id" element={<EditarBodega />} />
      <Route path="/*" element={<Navigate to="/sync/bodegas/home" />} />
    </Routes>
  );
}

export default RouterBodegas;
