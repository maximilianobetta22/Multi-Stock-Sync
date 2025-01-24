import { Navigate, Route, Routes } from "react-router-dom";

import FiltrarDatos from "../Views/FiltrarDatos/FiltrarDatos";
import ExportarDatos from "../Views/ExportarDatos/ExportarDatos";
import HomeReportes from "../Views/Home/HomeReportes";
import VentasPorDia from "../Views/VentasPorDia/VentasPorDia";
import { VentasPorMes } from "../Views/VentasPorMes/VentasPorMes";
import IngresosSemana from "../Views/IngresosSemana/IngresosSemana";
import MetodosPago from "../Views/MetodosPago/MetodosPago";
import DevolucionesReembolso from "../Views/DevolucionesReembolsos/DevolucionesReembolsos";
import ProductosMasVendidos from "../Views/ProductosMasVendidos/ProductosMasVendidos";
import OpinionesClientes from "../Views/OpinionesClientes/OpinionesClients";
import IngresosCategoriaProducto from "../Views/IngresosCategoriaProducto/IngresosCategoriaProducto";
import EstadosOrdenes from "../Views/EstadosOrdenes/EstadosOrdenes";


function RouterReportes() {

    return (
        <Routes>
           <Route path="/*" element={<Navigate to="/sync/reportes/home" />} />  
            <Route path="home" element={<HomeReportes/>} />
            <Route path="filtrar-datos/:client_id" element={<FiltrarDatos />} />
            <Route path="exportar-datos/:client_id" element={<ExportarDatos />} />
            <Route path="ingreso-semana/:client_id" element={< IngresosSemana/>} />
            <Route path="ventas-dia/:client_id" element={<VentasPorDia />} />
            <Route path="ventas-mes/:client_id" element={<VentasPorMes />} />
            <Route path="metodos-pago/:client_id" element={<MetodosPago />} />
            <Route path="devoluciones-reembolsos/:client_id" element={<DevolucionesReembolso />} />
            <Route path="productos-mas-vendidos/:client_id" element={<ProductosMasVendidos />} />
            <Route path="opiniones-clientes/:client_id" element={<OpinionesClientes />} />
            <Route path="ingresos-categoria-producto/:client_id" element={<IngresosCategoriaProducto />} />
            <Route path="estados-ordenes/:client_id" element={<EstadosOrdenes />} />

        </Routes>
    );
};

export default RouterReportes;