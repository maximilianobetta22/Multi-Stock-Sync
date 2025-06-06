import { Route, Routes } from "react-router-dom";
import GestionProducto from "../Views/GestionProducto";
import CrearProducto from "../Views/components/CrearProducto";
import CargaMasiva from "../Views/CargaMasiva";
import EditarProducto from "../Views/components/EditarProducto"; // ✅ faltaba
import MercadoLibreCategorySelector from "../Views/components/MercadoLibreCategorySelector";
import WooCommerceProductsList from "../Views/components/WooCommerceProductsList";

const RouterProducto = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionProducto />} />
      <Route path="/crear" element={<CrearProducto />} />
      <Route path="/carga-masiva" element={<CargaMasiva />} />
      <Route path="/plantillas-mercadolibre" element={<MercadoLibreCategorySelector />} />
      <Route path="/woocommerce" element={<WooCommerceProductsList />} />
      <Route path="/editar" element={<EditarProducto />} />
    </Routes>
  );
};

export default RouterProducto;
