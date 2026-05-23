import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: ReactElement;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
