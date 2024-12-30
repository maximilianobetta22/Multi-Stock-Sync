import React, { useState } from 'react';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const Navbar: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const handleDropdownToggle = (dropdown: 'settings' | 'user') => {
        if (dropdown === 'settings') {
            setDropdownOpen(!dropdownOpen);
            if (userDropdownOpen) setUserDropdownOpen(false);
        } else {
            setUserDropdownOpen(!userDropdownOpen);
            if (dropdownOpen) setDropdownOpen(false);
        }
    };

    return (
        <nav className="main-navbar navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <img src="/path-to-logo.png" alt="Multi-Stock-Sync" className="main-logo" />
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-center" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#">Documentos</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Despacho</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Punto de Venta</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Stock</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Reportes</a>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <button className="btn btn-yellow me-2">¡Ayuda!</button>
                        <div className="settings-dropdown">
                            <button className="btn btn-secondary" onClick={() => handleDropdownToggle('settings')}>
                                <FontAwesomeIcon icon={faCog} />
                            </button>
                            <div className={`settings-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                <a className="settings-dropdown-item" href="#">Productos y Servicios</a>
                                <a className="settings-dropdown-item" href="#">Lista de Precios</a>
                                <a className="settings-dropdown-item" href="#">Clientes</a>
                                <a className="settings-dropdown-item" href="#">Sucursales</a>
                                <a className="settings-dropdown-item" href="#">Ver Mas</a>
                            </div>
                        </div>
                        <div className="user-info d-flex align-items-center">
                            <div className="user-dropdown">
                                <div className="user-initial-circle" onClick={() => handleDropdownToggle('user')}>P</div>
                                <div className={`user-dropdown-menu ${userDropdownOpen ? 'show' : ''}`}>
                                    <div className="user-dropdown-item user-info-item">Persona_12345678</div>
                                    <a className="user-dropdown-item" href="#">Casa Matriz</a>
                                    <a className="user-dropdown-item" href="#">Cambiar de Empresa</a>
                                    <a className="user-dropdown-item" href="#">Cambiar Contraseña</a>
                                    <a className="user-dropdown-item" href="#">Mi Cuenta</a>
                                    <a className="user-dropdown-item" href="#">Mis Sistemas</a>
                                    <a className="user-dropdown-item" href="#">Salir</a>
                                </div>
                            </div>
                            <div>
                                <span className="user-name">Persona</span>
                                <br />
                                <span className="business-name">Casa Matriz</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;