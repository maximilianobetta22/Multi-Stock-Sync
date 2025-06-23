import { Routes, Route, Navigate } from "react-router-dom";
import ConfiguracionMain from "../ConfiguracionMain";
import CambiarPassword from "../CambiarPassword";

export default function RouterConfiguracion() {
  return (
    <Routes>
      <Route path="/" element={<ConfiguracionMain />} />
      <Route path="/cambiar-password" element={<CambiarPassword />} />
      <Route path="*" element={<Navigate to="/configuracion" />} />
    </Routes>
  );
}
