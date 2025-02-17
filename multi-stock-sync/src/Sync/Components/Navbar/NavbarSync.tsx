import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import styles from "./NavbarSync.module.css";
import { UserContext } from "../../Context/UserContext";

const Navbar = () => {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { user, setUser } = userContext;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/sync/logout");
    setUser(null);
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
              <button className="btn btn-outline-light" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <div>
              <Link to="/sync/login" className="btn btn-outline-light mx-2">Iniciar sesión</Link>
              <Link to="/sync/register" className="btn btn-outline-light">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
