import React from "react";
import { Route, Routes } from "react-router-dom";
import PerfilUsuario from "../PerfilUsuario";
import EditarPerfil from "../EditarPerfil";

const RouterPerfil = () => {
  return (
    <Routes>
      <Route path="/" element={<PerfilUsuario />} />
      <Route path="/editar" element={<EditarPerfil />} />
    </Routes>
  );
};

export default RouterPerfil;
