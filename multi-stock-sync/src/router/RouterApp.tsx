import { Navigate, Route, Routes } from "react-router-dom";
import RouterSync from "../Sync/Router/RouterSync";

function RouterApp() {

  return (
    <Routes>


        <Route path="/sync/*" element={<RouterSync />} />

        <Route path="/*" element={<Navigate to="/sync" />} />
    </Routes>
  );
};

export default RouterApp;