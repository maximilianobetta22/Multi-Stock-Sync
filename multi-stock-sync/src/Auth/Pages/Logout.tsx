import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { LoadingDinamico } from "../../components/LoadingDinamico/LoadingDinamico";


const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await axiosInstance.post(`${import.meta.env.VITE_API_URL}/logout`);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/sync/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    logout();
  }, [navigate]);

  return <LoadingDinamico  variant="container"/>;
};

export default Logout;
