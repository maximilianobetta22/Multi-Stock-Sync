import { Navigate, Route, Routes } from "react-router-dom";
import RouterSync from "../Sync/Router/RouterSync";
import { AuthRouter } from "../Auth/Router/AuthRouter";

function RouterApp() {

  return (
    <Routes>
        <Route path="/auth/*" element={<AuthRouter />} />

        <Route path="/sync/*" element={<RouterSync />} />

        <Route path="/*" element={<Navigate to="/sync" />} />
    </Routes>
  );
};

export default RouterApp;