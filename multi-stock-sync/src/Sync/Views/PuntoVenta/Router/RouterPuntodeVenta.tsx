import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GestionVenta from "../GestionVenta";
import Pagina404 from "../../Error/Pagina404";
const RouterPuntodeVenta: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionVenta/>} />
       <Route path="*" element={<Pagina404 />} />
    </Routes>
  );
};

export default RouterPuntodeVenta;