import React, { useState } from 'react';
import './AdminNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Link } from 'react-router-dom';

interface MiniNavbarProps {
    links: { name: string, url: string }[];
    dropdowns: { name: string, options: { name: string, url: string }[] }[];
}

const AdminNavbar: React.FC<MiniNavbarProps> = ({ links, dropdowns }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [miniDropdownOpen, setMiniDropdownOpen] = useState<{ [key: number]: boolean }>({});

    const handleDropdownToggle = (dropdown: 'settings' | 'user') => {
        if (dropdown === 'settings') {
            setDropdownOpen(!dropdownOpen);
            if (userDropdownOpen) setUserDropdownOpen(false);
        } else {
            setUserDropdownOpen(!userDropdownOpen);
            if (dropdownOpen) setDropdownOpen(false);
        }
    };

    const handleMiniDropdownToggle = (index: number) => {
        setMiniDropdownOpen(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
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
                        {links.map((link, index) => (
                            <li className="nav-item" key={index}>
                                <Link className="nav-link" to={link.url}>{link.name}</Link>
                            </li>
                        ))}
                        {dropdowns.map((dropdown, index) => (
                            <li className="nav-item dropdown" key={index}>
                                <button className="nav-link" onClick={() => handleMiniDropdownToggle(index)}>
                                    {dropdown.name} <FontAwesomeIcon icon={faCaretDown} />
                                </button>
                                <div className={`dropdown-menu ${miniDropdownOpen[index] ? 'show' : ''}`}>
                                    {dropdown.options.map((option, idx) => (
                                        <Link className="dropdown-item" to={option.url} key={idx}>{option.name}</Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default AdminNavbar;
