import { Navigate, Route, Routes } from "react-router-dom";

import FiltrarDatos from "../Views/FiltrarDatos/FiltrarDatos";
import ExportarDatos from "../Views/ExportarDatos/ExportarDatos";
import HomeReportes from "../Views/Home/HomeReportes";

import VentasPorDia from "../Views/Ventas_Reportes/VentasPorDia";
import VentasPorMes from "../Views/Ventas_Reportes/VentasPorMes";
import VentasPorYear from "../Views/Ventas_Reportes/VentasPorYear";
import DetallesDeVentas from "../Views/Ventas_Reportes/Ventas";

import IngresosSemana from "../Views/IngresosSemana/IngresosSemana";
import MetodosPago from "../Views/MetodosPago/MetodosPago";
import DevolucionesReembolso from "../Views/DevolucionesReembolsos/DevolucionesReembolsos";
import DetalleReembolso from "../Views/DevolucionesReembolsos/DetalleReembolso/DetalleReembolso";
import ProductosMasVendidos from "../Views/ProductosMasVendidos/ProductosMasVendidos";
import OpinionesClientes from "../Views/OpinionesClientes/OpinionesClients";
import IngresosCategoriaProducto from "../Views/IngresosCategoriaProducto/IngresosCategoriaProducto";
import { IngresosProductosProvider } from "../Views/IngresosCategoriaProducto/Context/IngresosProductosProvider";
import EstadosOrdenes from "../Views/EstadosOrdenes/EstadosOrdenes";
import EstadosOrdenesAnual from "../Views/EstadoOrdenesAnuales/EstadoOrdenesAnuales";
import ReportesCancelados from "../Views/ReportesCancelados/ReportesCancelados";

import ReporteDisponible from "../Views/ReporteDisponible/ReporteDisponible";
import ReporteRecepcion from "../Views/ReporteRecepcion/ReporteRecepcion";
import ProductosDespachar from "../Views/ProductosDespachar/ProductosDespachar";
import HistorialDespacho from "../Views/ProductosDespachar/HistorialDespacho";
import ReporteHistorialStock from "../Views/HistorialStock/ReporteHistorialStock";
import Plantilla from "../Views/Plantillas/plantillas";

// ✅ Nueva vista unificada de comparación
import Compare from "../Views/Compare/Compare";
import StockCritico from "../Views/StockCritico/ReporteStockCritico";

function RouterReportes() {
  return (
    <Routes>
      <Route path="/*" element={<Navigate to="/sync/reportes/home" />} />
      <Route path="home" element={<HomeReportes />} />

      {/* Página central de reportes */}
      <Route path="ventas/:client_id" element={<DetallesDeVentas />} />

      {/* Subpáginas de reportes de ventas */}
      <Route path="ventas-dia/:client_id" element={<VentasPorDia />} />
      <Route path="ventas-mes/:client_id" element={<VentasPorMes />} />
      <Route path="ventas-year/:client_id" element={<VentasPorYear />} />

      {/* Otras rutas de reportes */}
      <Route path="filtrar-datos/:client_id" element={<FiltrarDatos />} />
      <Route path="exportar-datos/:client_id" element={<ExportarDatos />} />
      <Route path="historial-Stock/:client_id" element={<ReporteHistorialStock />} />
      <Route path="stock-critico/:client_id" element={<StockCritico />} />
      <Route path="ingreso-semana/:client_id" element={<IngresosSemana />} />
      <Route path="Reporte-Disponible/:client_id" element={<ReporteDisponible />} />
      <Route path="Reporte-Recepcion/:client_id" element={<ReporteRecepcion />} />
      <Route path="Despachar-Producto/:client_id" element={<ProductosDespachar />} />
      <Route path="historial/:client_id" element={<HistorialDespacho />} />
      <Route path="metodos-pago/:client_id" element={<MetodosPago />} />
      <Route path="devoluciones-reembolsos/:client_id" element={<DevolucionesReembolso />} />
      <Route path="devoluciones-reembolsos/:client_id/detalle/:refund_id" element={<DetalleReembolso />} />
      <Route path="productos-mas-vendidos/:client_id" element={<ProductosMasVendidos />} />
      <Route path="opiniones-clientes/:client_id" element={<OpinionesClientes />} />
      <Route path="reportes-cancelados/:client_id" element={<ReportesCancelados />} />

      <Route
        path="ingresos-categoria-producto/:client_id"
        element={
          <IngresosProductosProvider>
            <IngresosCategoriaProducto />
          </IngresosProductosProvider>
        }
      />
      <Route path="estados-ordenes/:client_id" element={<EstadosOrdenes />} />
      <Route path="estados-ordenes-anual/:client_id" element={<EstadosOrdenesAnual />} />

      {/* ✅ Ruta unificada para comparaciones por mes o año */}
      <Route path="compare/:mode/:client_id" element={<Compare />} />

      <Route path="plantillas/:client_id" element={<Plantilla />} />
    </Routes>
  );
}

export default RouterReportes;
