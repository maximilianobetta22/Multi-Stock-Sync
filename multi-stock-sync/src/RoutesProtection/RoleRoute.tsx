// RoleRoute.tsx
import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactElement;
  allowedRoleIds: number[];
}

const RoleRoute = ({ children, allowedRoleIds }: Props) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const userRoleId = user?.role_id;

  if (!token || !user || !allowedRoleIds.includes(userRoleId)) {
    return <Navigate to="/sync/403" replace />;
  }

  return children;
};

export default RoleRoute;
