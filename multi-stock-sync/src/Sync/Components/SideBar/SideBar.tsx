import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBoxOpen,
  faWarehouse,
  faPlug,
  faBriefcase,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  return (
    <div>
      <div className={styles.container}>
        <ul className={styles.NavList}>
          <li>
            <NavLink to={"/sync/menu"} className={styles.NavLink}>
              <FontAwesomeIcon icon={faHouse} />
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/productos" className={styles.NavLink}>
              <FontAwesomeIcon icon={faBoxOpen} />
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/bodegas" className={styles.NavLink}>
              <FontAwesomeIcon icon={faWarehouse} />
              Bodegas
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/conexiones" className={styles.NavLink}>
              <FontAwesomeIcon icon={faPlug} />
              Conexiones a ML
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/companias" className={styles.NavLink}>
              <FontAwesomeIcon icon={faBriefcase} />
              Compañías
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/reportes" className={styles.NavLink}>
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
