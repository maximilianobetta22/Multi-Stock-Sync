import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDropdownToggle = (dropdown: 'settings' | 'user') => {
    if (dropdown === 'settings') {
      setDropdownOpen(!dropdownOpen);
      if (userDropdownOpen) setUserDropdownOpen(false);
    } else {
      setUserDropdownOpen(!userDropdownOpen);
      if (dropdownOpen) setDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${process.env.VITE_API_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className={styles.mainNavbar}>
      <Link className="navbar-brand" to="#">
        <img src="/path-to-logo.png" alt="Multi-Stock-Sync" className={styles.mainLogo} />
      </Link>
      <div className={styles.navLinks}>
        <Link className={`${styles.navLink} nav-link active`} aria-current="page" to="/admin/documentos">Documentos</Link>
        <Link className={styles.navLink} to="/punto-venta/despacho">Despacho</Link>
        <Link className={styles.navLink} to="/punto-venta">Punto de Venta</Link>
        <Link className={styles.navLink} to="/admin/stock">Stock</Link>
        <Link className={styles.navLink} to="/admin/reportes">Reportes</Link>
      </div>
      <div className={styles.userActions}>
        {isAuthenticated ? (
          <>
            <div className={styles.settingsDropdown}>
              <FontAwesomeIcon 
                icon={faCog} 
                className={styles.settingsIcon} 
                onClick={() => handleDropdownToggle('settings')} 
              />
              <div className={`${styles.settingsDropdownMenu} ${dropdownOpen ? styles.settingsDropdownMenuShow : ''}`}>
                <Link className={styles.settingsDropdownItem} to="/admin/productos-servicios">Productos y Servicios</Link>
                <Link className={styles.settingsDropdownItem} to="#">Lista de Precios</Link>
                <Link className={styles.settingsDropdownItem} to="#">Clientes</Link>
                <Link className={styles.settingsDropdownItem} to="#">Sucursales</Link>
                <Link className={styles.settingsDropdownItem} to="#">Ver Mas</Link>
              </div>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userDropdown}>
                <div className={styles.userInitialCircle} onClick={() => handleDropdownToggle('user')}>
                  {user.nombre.charAt(0)}
                </div>
                <div className={`${styles.userDropdownMenu} ${userDropdownOpen ? styles.userDropdownMenuShow : ''}`}>
                  <div className={`${styles.userDropdownItem} ${styles.userDropdownItemUserInfoItem}`}>{user.nombre}</div>
                  <Link className={styles.userDropdownItem} to="#">Cambiar de Empresa</Link>
                  <Link className={styles.userDropdownItem} to="#">Cambiar Contraseña</Link>
                  <Link className={styles.userDropdownItem} to="#">Mi Cuenta</Link>
                  <Link className={styles.userDropdownItem} to="#">Mis Sistemas</Link>
                  <Link className={`${styles.userDropdownItem} text-danger`} onClick={handleLogout} to="#">Salir</Link>
                </div>
              </div>
              <div>
                <span className={styles.userName}>{user.nombre} {user.apellidos}</span>
                <br />
                <span className={styles.businessName}>{user.nombre_negocio}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link className={styles.btnYellow} to="/login">Iniciar Sesión</Link>
            <Link className={styles.btnGreen} to="/register">Registrarme</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;