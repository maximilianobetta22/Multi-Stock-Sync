import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GestionUsuarios from "../views/GestionUsuarios";

const RouterGestionUsuarios: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionUsuarios />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default RouterGestionUsuarios;
