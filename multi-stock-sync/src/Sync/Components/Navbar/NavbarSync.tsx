import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosConfig";
import styles from "./NavbarSync.module.css";

interface User {
  nombre: string;
  apellidos: string;
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/logout`);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/sync/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid">
        <Link to="/sync/home" className={`navbar-brand`}>
          <img src="/assets/img/logo/logo-blanco-text.svg" alt="Logo" className={styles.logoImage} />
        </Link>
        <div className="d-flex align-items-center ms-auto">
          {user ? (
            <>
              <span className="navbar-text me-3 text-light">{user.nombre} {user.apellidos}</span>
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/sync/login" className="btn btn-outline-light">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
