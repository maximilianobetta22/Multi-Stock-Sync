import { NavLink, useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBoxOpen,
  faWarehouse,
  faPlug,
  faFolderOpen,
  faHandshake
} from "@fortawesome/free-solid-svg-icons";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

const SideBar = () => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { setUser } = userContext;

  const handleLogout = () => {
    navigate("/sync/logout");
    setUser(null);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.NavList}>
        <div className={styles.NavItems}>
          <li>
            <NavLink to="/sync/perfil" className={styles.NavLink}>
              <UserOutlined style={{ fontSize: "18px", marginRight: "8px" }} />
              Perfil
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/home" className={styles.NavLink}>
              <FontAwesomeIcon icon={faHouse} />
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/productos" className={styles.NavLink}>
              <FontAwesomeIcon icon={faBoxOpen} />
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/bodegas/home" className={styles.NavLink}>
              <FontAwesomeIcon icon={faWarehouse} />
              Bodegas
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/conexiones/home" className={styles.NavLink}>
              <FontAwesomeIcon icon={faPlug} />
              Conexiones a ML
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/reportes/home" className={styles.NavLink}>
              <FontAwesomeIcon icon={faFolderOpen} />
              Reportes
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/about" className={styles.NavLink}>
              <FontAwesomeIcon icon={faHandshake} />
              Sobre el proyecto <br /> (Developers)
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/configuracion" className={styles.NavLink}>
              <SettingOutlined style={{ fontSize: "18px", marginRight: "8px" }} />
              Configuración
            </NavLink>
          </li>
        </div>
        <div className={styles.BottomSection}>
          {userContext.user && (
          <li
            onClick={handleLogout}
            className={styles.NavLink}
            style={{ cursor: "pointer" }}
          >
            <LogoutOutlined style={{ fontSize: "18px", marginRight: "8px" }} />
            Cerrar sesión
          </li>
          )}
          <div className={styles.LogoWrapper}>
            <NavLink to="/sync/lading" className={styles.LogoLink}>
              <img
                src="/assets/img/logo/Crazy_logo_bordes.png"
                alt="Multi Stock Sync"
                className={styles.LogoImage}
              />
            </NavLink>
          </div>
        </div>
      </ul>
    </div>
  );
};

export default SideBar;
