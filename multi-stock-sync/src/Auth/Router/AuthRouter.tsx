import { Navigate, Route, Routes } from "react-router-dom";
import { Login, Register} from "../Pages";

export const AuthRouter = () => {
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};