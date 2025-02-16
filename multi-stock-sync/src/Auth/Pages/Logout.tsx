import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/logout`);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    logout();
  }, [navigate]);

  return null;
};

export default Logout;
