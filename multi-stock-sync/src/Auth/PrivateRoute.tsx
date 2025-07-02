 // Protección de Rutas si esta logeado
import { ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactElement;
}

const PrivateRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token"); 

  if (!token) {
    // Si no hay token → redirige al login
    return <Navigate to="/sync/login" replace />;
  }

  // Si está logueado → renderiza la vista
  return children;
};

export default PrivateRoute;
