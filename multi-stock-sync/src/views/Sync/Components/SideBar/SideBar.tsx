import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHouse,
  faWarehouse,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  return (
    <div>
      <div className={styles.container}>
        <ul className={styles.NavList}>
          <li>
            <NavLink to="/sync/perfil" className={styles.NavLink}>
              <FontAwesomeIcon icon={faUser} />
              perfil
            </NavLink>
          </li>
          <li>
            <NavLink to={"/sync/menu"} className={styles.NavLink}>
              <FontAwesomeIcon icon={faHouse} />
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/productos" className={styles.NavLink}>
              <FontAwesomeIcon icon={faTruckFast} />
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/bodegas" className={styles.NavLink}>
              <FontAwesomeIcon icon={faWarehouse} />
              Bodegas
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
