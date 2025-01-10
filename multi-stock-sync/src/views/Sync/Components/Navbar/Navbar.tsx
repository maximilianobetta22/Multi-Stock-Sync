import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid">
        <Link to="/sync/home" className={`navbar-brand ${styles.logo}`}> 
        <img src="/assets/img/logo/logo-text.svg" alt="Logo" className={styles.logoImage} />
        </Link>
        <div className="d-flex">
          <button className={`btn ${styles.iconButton}`} aria-label="Settings">
            <i className="bi bi-gear"></i>
          </button>
          <button className={`btn ${styles.iconButton}`} aria-label="Logout">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
