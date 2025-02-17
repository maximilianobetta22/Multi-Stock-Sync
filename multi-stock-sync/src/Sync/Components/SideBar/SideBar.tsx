import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBoxOpen,
  faWarehouse,
  faPlug,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  return (
    <div>
      <div className={styles.container}>
        <ul className={styles.NavList}>
          <li>
            <NavLink to={"/sync/home"} className={styles.NavLink}>
              <FontAwesomeIcon icon={faHouse} />
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/productos/home" className={styles.NavLink}>
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
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
