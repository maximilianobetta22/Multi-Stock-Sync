import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GestionVentas from "../GestionVentas";

const RouterGestionVenta: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionVentas />} />
      <Route path="*" element={<Navigate to="/sync/Ventas" />} />
    </Routes>
  );
};

export default RouterGestionVenta;
