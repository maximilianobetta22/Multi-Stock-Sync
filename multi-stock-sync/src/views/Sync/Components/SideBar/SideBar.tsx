import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css';

const SideBar = () => {

  return (
    <div className={styles.container}>
      <ul>
        <li>
          <NavLink to="/sync/perfil">Perfil</NavLink>
        </li>
        <li>
          <NavLink to="/sync/productos">Productos</NavLink>
        </li>
        <li>
          <NavLink to="/sync/conexiones">Conexiones</NavLink>
        </li>
        <li>
          <NavLink to="/sync/woocommerce">WooCommerce</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;