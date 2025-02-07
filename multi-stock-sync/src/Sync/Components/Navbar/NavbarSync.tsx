import { Link } from "react-router-dom";
import styles from "./NavbarSync.module.css";

const Navbar = () => {
  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid">
        <Link to="/sync/home" className={`navbar-brand`}>
          <img src="/assets/img/logo/logo-blanco-text.svg" alt="Logo" className={styles.logoImage} />
        </Link>
        <div className="d-flex align-items-center ms-auto">
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
