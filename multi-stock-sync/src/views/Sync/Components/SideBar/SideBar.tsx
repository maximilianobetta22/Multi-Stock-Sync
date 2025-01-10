import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHouse,
  faWarehouse,
  faCodeBranch,
  faStore,
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
              <FontAwesomeIcon icon={faWarehouse} />
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/conexiones" className={styles.NavLink}>
              <FontAwesomeIcon icon={faCodeBranch} />
              Conexiones
            </NavLink>
          </li>
          <li>
            <NavLink to="/sync/woocommerce" className={styles.NavLink}>
              <FontAwesomeIcon icon={faStore} />
              WooCommerce
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
