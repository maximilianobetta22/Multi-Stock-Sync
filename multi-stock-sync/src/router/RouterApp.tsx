import { Navigate, Route, Routes } from "react-router-dom";
import RouterSync from "../Sync/Router/RouterSync";
import OpinionesClients from "../Sync/Views/Reportes/Views/OpinionesClientes/OpinionesClients";

function RouterApp() {

  return (
    <Routes>

        <Route path="/sync/reportes/opiniones-clientes/:product_id" element={<OpinionesClients />} />



        <Route path="/sync/*" element={<RouterSync />} />

        <Route path="/*" element={<Navigate to="/sync" />} />
    </Routes>
  );
};

export default RouterApp;