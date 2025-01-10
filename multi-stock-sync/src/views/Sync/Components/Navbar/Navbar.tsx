import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid">
        <Link to="/sync/home" className={`navbar-brand`}>
          <img src="/assets/img/logo/logo-blanco-text.svg" alt="Logo" className={styles.logoImage} />
        </Link>
        <div className="d-flex align-items-center ms-auto">

          <div className="dropdown">
            <button
              className={`btn ${styles.iconButton}`}
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-end ${styles.dropdownMenu}`}
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <Link to="/sync/productos" className="dropdown-item">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/sync/bodegas" className="dropdown-item">
                  Bodegas
                </Link>
              </li>
              <li>
                <Link to="/admin" className="dropdown-item text-danger">
                  Salir a inicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
