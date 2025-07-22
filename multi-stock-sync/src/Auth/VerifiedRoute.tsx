import { ReactElement, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosInstance from "../axiosConfig"; // Ajusta la ruta según tu estructura

interface Props {
  children: ReactElement;
  requireVerification?: boolean; // Si es true, requiere verificación
}

const VerifiedRoute = ({ children, requireVerification = false }: Props) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // null = checking
  const [isChecking, setIsChecking] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkVerification = async () => {
      if (!token || !requireVerification) {
        setIsChecking(false);
        setIsVerified(true); // Si no requiere verificación, permitir acceso
        return;
      }

      try {
        const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/verified-status`);
        setIsVerified(response.data.verified);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsVerified(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkVerification();
  }, [token, requireVerification]);

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/sync/login" replace />;
  }

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Verificando...</div>
      </div>
    );
  }

  // Si requiere verificación y no está verificado, redirigir
  if (requireVerification && !isVerified) {
    return <Navigate to="/sync/verify-email" replace />;
  }

  // Todo está bien, mostrar el componente
  return children;
};

export default VerifiedRoute;