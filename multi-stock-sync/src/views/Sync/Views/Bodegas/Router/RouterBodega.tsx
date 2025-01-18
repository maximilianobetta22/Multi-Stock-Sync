import { Navigate, Route, Routes } from "react-router-dom";

import HomeBodega from "../Views/Home/HomeBodega";
import CrearBodega from "../Views/Crear/CrearBodega";
import EditarBodega from "../Views/Editar/EditarBodega";
import DetalleBodega from "../Views/DetalleBodega/DetalleBodega";
function RouterBodegas() {

    return (
        <Routes>
            <Route path="/home" element={<HomeBodega />} />
            <Route path="/crear" element={<CrearBodega />} />
            <Route path="/detalleBodega/:id" element={<DetalleBodega/>} />
            <Route path="/editar/:id" element={<EditarBodega />} />
            <Route path="/*" element={<Navigate to="/sync/bodegas/home"/>}/>
        </Routes>
    );
};

export default RouterBodegas;