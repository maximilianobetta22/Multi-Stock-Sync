import React, { useState } from 'react';
import './AdminNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Link } from 'react-router-dom';

const AdminNavbar: React.FC = () => {
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
        <>
            <nav className="main-navbar navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="#">
                        <img src="/path-to-logo.png" alt="Multi-Stock-Sync" className="main-logo" />
                    </Link>
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
                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/admin/documentos">Documentos</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/punto-venta/despacho">Despacho</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/punto-venta">Punto de Venta</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/stock">Stock</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/reportes">Reportes</Link>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center">
                            <div className="settings-dropdown">
                                <button className="btn btn-secondary" onClick={() => handleDropdownToggle('settings')}>
                                    <FontAwesomeIcon icon={faCog} />
                                </button>
                                <div className={`settings-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                    <Link className="settings-dropdown-item" to="#">Productos y Servicios</Link>
                                    <Link className="settings-dropdown-item" to="#">Lista de Precios</Link>
                                    <Link className="settings-dropdown-item" to="#">Clientes</Link>
                                    <Link className="settings-dropdown-item" to="#">Sucursales</Link>
                                    <Link className="settings-dropdown-item" to="#">Ver Mas</Link>
                                    <Link className="settings-dropdown-item text-danger" to="/">Volver a inicio</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="mini-navbar">
                <div className="container-fluid">
                    <ul className="mini-navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Mis Productos y Servicios</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Marcas</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Config. Masiva</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Listas de Precio</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default AdminNavbar;
