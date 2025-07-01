import { Navigate, Route, Routes } from "react-router-dom";
import Pagina404 from "../../Error/Pagina404";
import HomeBodega from "../Views/Home/HomeBodega";

function RouterBodegas() {
  return (
    <Routes>
      <Route path="/home" element={<HomeBodega />} />
      <Route path="*" element={<Pagina404 />} />
      
    </Routes>
  );
}

export default RouterBodegas;
