import { Navigate, Route, Routes } from "react-router-dom";
import Pagina404 from "../../Error/Pagina404";
import HomeBodega from "../Views/Home/HomeBodega";
import DetalleBodega from "../Views/Detalle/DetalleBodega";

function RouterBodegas() {
  return (
    <Routes>
      <Route path="/home" element={<HomeBodega />} />
      <Route path="*" element={<Pagina404 />} />
      <Route path="/DetalleBodega/:id" element={<DetalleBodega />} />
    </Routes>
  );
}

export default RouterBodegas;
