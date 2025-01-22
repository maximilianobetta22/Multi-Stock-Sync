import { Navigate, Route, Routes } from "react-router-dom";

import FiltrarDatos from "../Views/FiltrarDatos/FiltrarDatos";
import ExportarDatos from "../Views/ExportarDatos/ExportarDatos";
import HomeReportes from "../Views/Home/HomeReportes";


function RouterReportes() {

    return (
        <Routes>
            <Route path="/*" element={<Navigate to="/sync/reportes/home" />} />
            <Route path="home" element={<HomeReportes/>} />
            <Route path="filtrar-datos" element={<FiltrarDatos />} />
            <Route path="exportar-datos" element={<ExportarDatos />} />
        </Routes>
    );
};

export default RouterReportes;