import React, { useState } from 'react';
import './PuntoVentaNavbar.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const PuntoVentaNavbar: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="main-navbar punto-venta-navbar navbar navbar-expand-lg bg-light border-bottom-orange">
            <div className="container-fluid">
                
                <div className="dropdown">
                    <button
                        className="btn dropdown-toggle btn-orange-border"
                        type="button"
                        id="dropdownMenuButton"
                        onClick={handleDropdownToggle}
                        aria-expanded={dropdownOpen}
                    >
                        Ventas
                    </button>
                    <ul
                        className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}
                        aria-labelledby="dropdownMenuButton"
                    >
                        <li>
                            <a className="dropdown-item" href="#">
                                Opción 1
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Opción 2
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Opción 3
                            </a>
                        </li>
                    </ul>
                </div>

                
                <div className="navbar-brand mx-auto">
                    <img
                        src="/path-to-logo.png"
                        alt="Multi-Stock-Sync"
                        className="navbar-logo"
                    />
                </div>
                <div className="help-icon">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                </div>
            </div>
        </nav>
    );
};

export default PuntoVentaNavbar;
