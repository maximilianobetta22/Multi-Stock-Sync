import { Navigate, Route, Routes } from "react-router-dom";

import ListarCompanias from "../Views/Listar/ListarCompanias";
import DetalleCompania from "../Views/Detalle/DetalleCompania";
import CrearCompania from "../Views/Crear/CrearCompania";

function RouterCompania() {
    return (
        <Routes>
            <Route path="/home" element={<ListarCompanias />} />
            <Route path="/crear" element={<CrearCompania />} />
            <Route path="/detalleCompania/:id" element={<DetalleCompania />} />
            <Route path="/editar/:id" element={<div>Editar Compania</div>} />
            <Route path="/*" element={<Navigate to="/sync/companias/home"/>}/>
        </Routes>
    );
};

export default RouterCompania;