import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHouse,
  faBoxOpen,
  faWarehouse,
  faPlug,
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
            <NavLink to="/sync/perfil" className={styles.NavLink}>
              <FontAwesomeIcon icon={faPlug} />
              Conexiones a ML
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
