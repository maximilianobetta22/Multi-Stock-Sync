import { Navigate, Route, Routes } from "react-router-dom";

import FiltrarDatos from "../Views/FiltrarDatos/FiltrarDatos";
import ExportarDatos from "../Views/ExportarDatos/ExportarDatos";
import HomeReportes from "../Views/Home/HomeReportes";
import VentasPorDia from "../Views/VentasPorDia/VentasPorDia";
import IngresosSemana from "../Views/IngresosSemana/IngresosSemana";
import MetodosPago from "../Views/MetodosPago/MetodosPago";
import DevolucionesReembolso from "../Views/Home/DevolucionesReembolsos/DevolucionesReembolsos";


function RouterReportes() {

    return (
        <Routes>
           <Route path="/*" element={<Navigate to="/sync/reportes/home" />} />  
            <Route path="home" element={<HomeReportes/>} />
            <Route path="filtrar-datos" element={<FiltrarDatos />} />
            <Route path="exportar-datos" element={<ExportarDatos />} />
            <Route path="ingreso-semana" element={< IngresosSemana/>} />
            <Route path="ventas-dia" element={<VentasPorDia />} />
            <Route path="metodos-pago" element={<MetodosPago />} />
            <Route path="devoluciones-reembolsos" element={<DevolucionesReembolso />} />
        </Routes>
    );
};

export default RouterReportes;