// src/Auth/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

const PublicRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Ya está logueado → redirigir a home u otra vista
    return <Navigate to="/sync/home" replace />;
  }

  return children;
};

export default PublicRoute;
