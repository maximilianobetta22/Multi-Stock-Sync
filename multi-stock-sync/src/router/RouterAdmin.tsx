import { Navigate, Route, Routes } from "react-router-dom";
import Documentos from "../views/Admin/Documentos/Documentos";
import CrearProducto from "../views/Admin/ProductosServicios/Crear/Producto/CrearProducto";
import CrearServicio from "../views/Admin/ProductosServicios/Crear/Servicio/CrearServicio";
import CrearPackPromocion from "../views/Admin/ProductosServicios/Crear/Pack-Promocion/CrearPackPromocion";
import EditarPackPromocion from "../views/Admin/ProductosServicios/Editar/Pack-Promocion/EditarPackPromocion";
import EditarProducto from "../views/Admin/ProductosServicios/Editar/Producto/EditarProducto";
import EditarServicio from "../views/Admin/ProductosServicios/Editar/Servicio/EditarServicio";
import AdminReportes from "../views/Admin/Reportes/Reportes";
import RecepcionStock from "../views/PuntoVenta/RecepcionStock/RecepcionStock";
import CrearMarca from "../views/Admin/Marcas/Crear/CrearMarca";
import EditarMarca from "../views/Admin/Marcas/Editar/EditarMarca";
import ListarTipos from "../views/Admin/Tipos/Listar/ListarTipos";
import CrearTipo from "../views/Admin/Tipos/Crear/CrearTipo";
import EditarTipo from "../views/Admin/Tipos/Editar/EditarTipo";
import LayoutApp from "../layout/LayoutApp";
import InitialPage from "../views/InitialPage";

function RouterAdmin() {
  
  return (
    <LayoutApp>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/productos-servicios/crear/producto" element={<CrearProducto />} />
        <Route path="/productos-servicios/crear/servicio" element={<CrearServicio />} />
        <Route path="/productos-servicios/crear/pack-promocion" element={<CrearPackPromocion />} />
        <Route path="/productos-servicios/editar/pack-promocion/:id" element={<EditarPackPromocion />} />
        <Route path="/productos-servicios/editar/producto/:id" element={<EditarProducto />} />
        <Route path="/productos-servicios/editar/servicio/:id" element={<EditarServicio />} />
        <Route path="/reportes" element={<AdminReportes />} />
        <Route path="/stock" element={<RecepcionStock />} />
        <Route path="/marcas" element={<CrearMarca />} />
        <Route path="/marcas" element={<EditarMarca />} />
        <Route path="/tipos" element={<ListarTipos />} />
        <Route path="/tipos/crear" element={<CrearTipo />} />
        <Route path="/tipos/editar/:id" element={<EditarTipo />} />

        <Route path="/*" element={<Navigate to="/admin/" />} />
      </Routes>
    </LayoutApp>
  );
};

export default RouterAdmin;