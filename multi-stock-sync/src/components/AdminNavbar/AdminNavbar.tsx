import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminNavbar.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Link } from 'react-router-dom';

interface MiniNavbarProps {
  links?: { name: string; url: string }[];
  dropdowns?: { name: string; options: { name: string; url: string }[] }[];
}

const AdminNavbar: React.FC<MiniNavbarProps> = ({ links = [], dropdowns = [] }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [miniDropdownOpen, setMiniDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const [navbarHeight, setNavbarHeight] = useState(0);
  const miniDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Calculate the combined height of the navbar and mini-navbar
    const mainNavbar = document.querySelector(`.${styles.mainNavbar}`);
    const miniNavbar = document.querySelector(`.${styles.miniNavbar}`);
    if (mainNavbar && miniNavbar) {
      const totalHeight = mainNavbar.clientHeight + miniNavbar.clientHeight;
      setNavbarHeight(totalHeight);
    }

    const handleClickOutside = (event: MouseEvent) => {
      miniDropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target as Node)) {
          setMiniDropdownOpen((prevState) => ({
            ...prevState,
            [index]: false,
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMiniDropdownToggle = (index: number) => {
    setMiniDropdownOpen((prevState) => {
      const newState = Object.keys(prevState).reduce((acc, key) => {
        acc[Number(key)] = false; // Cerrar todos los dropdowns
        return acc;
      }, {} as { [key: number]: boolean });
  
      return {
        ...newState,
        [index]: !prevState[index], // Alternar el dropdown seleccionado
      };
    });
  };
  

  return (
    <>
      {/* Main Navbar */}
      <nav className={styles.mainNavbar}>
        <Link className="navbar-brand" to="#">
          <img src="/path-to-logo.png" alt="Multi-Stock-Sync" className={styles.mainLogo} />
        </Link>
        <div className={styles.navLinks}>
          <Link className={`${styles.navLink} nav-link active`} to="/admin/documentos">
            Documentos
          </Link>
          <Link className={styles.navLink} to="/punto-venta/despacho">
            Despacho
          </Link>
          <Link className={styles.navLink} to="/punto-venta">
            Punto de Venta
          </Link>
          <Link className={styles.navLink} to="/admin/stock">
            Stock
          </Link>
          <Link className={styles.navLink} to="/admin/reportes">
            Reportes
          </Link>
        </div>
        <div className={styles.userActions}>
          <div className={styles.settingsDropdown}>
            <FontAwesomeIcon
              icon={faCog}
              className={styles.settingsIcon}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            <div
              className={`${styles.settingsDropdownMenu} ${
                dropdownOpen ? styles.settingsDropdownMenuShow : ''
              }`}
            >
              <Link className={styles.settingsDropdownItem} to="/admin/productos-servicios">
                Productos y Servicios
              </Link>
              <Link className={styles.settingsDropdownItem} to="#">
                Lista de Precios
              </Link>
              <Link className={styles.settingsDropdownItem} to="#">
                Clientes
              </Link>
              <Link className={styles.settingsDropdownItem} to="#">
                Sucursales
              </Link>
              <Link className={styles.settingsDropdownItem} to="#">
                Ver Más
              </Link>
              <Link className={`${styles.settingsDropdownItem} text-danger`} to="/">
                Volver a inicio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mini-navbar */}
      <div className={styles.miniNavbar}>
        <ul className={styles.miniNavbarNav}>
          {links.map((link, index) => (
            <li className={`${styles.navItem}`} key={index}>
              <Link className={`${styles.navLink}`} to={link.url}>
                {link.name}
              </Link>
            </li>
          ))}
          {dropdowns.map((dropdown, index) => (
            <li className={`${styles.navItem} dropdown`} key={index}>
              <div
                className={`${styles.navLink}`}
                onClick={() => handleMiniDropdownToggle(index)}
              >
                {dropdown.name} <FontAwesomeIcon icon={faCaretDown} />
              </div>
              <div
                ref={(el) => (miniDropdownRefs.current[index] = el)}
                className={`${styles.dropdownMenu} ${
                  miniDropdownOpen[index] ? 'show' : ''
                }`}
              >
                {dropdown.options.map((option, idx) => (
                  <Link className={`${styles.dropdownItem}`} to={option.url} key={idx}>
                    {option.name}
                  </Link>
                ))}
              </div>

            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: `${navbarHeight}px` }}></div>
    </>
  );
};

export default AdminNavbar;
