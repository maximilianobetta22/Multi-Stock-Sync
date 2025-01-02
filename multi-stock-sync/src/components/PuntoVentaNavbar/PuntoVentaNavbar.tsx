import React, { useState, useEffect } from 'react';
import './PuntoVentaNavbar.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPrint,
    faCheckCircle,
    faArrowRight,
    faTimesCircle,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

const PuntoVentaNavbar: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');

    useEffect(() => {
        setCurrentLocation(window.location.pathname);
    }, []);

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <>
            <nav className="main-navbar punto-venta-navbar navbar navbar-expand-lg bg-light border-bottom-orange fixed-top">
                <div className="container-fluid">
                    <div className="dropdown">
                        <button
                            className="btn dropdown-toggle btn-orange-border"
                            type="button"
                            id="dropdownMenuButton"
                            onClick={handleDropdownToggle}
                            aria-expanded={dropdownOpen}
                        >
                            {currentLocation === '/punto-venta/punto-venta' ? 'Ventas' : 
                            currentLocation === '/punto-venta/despacho' ? 'Despacho' : 
                            currentLocation === '/punto-venta/reimprimir' ? 'Reimprimir' :
                            currentLocation === '/punto-venta/abono-cliente' ? 'Abono Cliente' :
                            'Ventas'}
                        </button>
                        <ul
                            className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}
                            aria-labelledby="dropdownMenuButton"
                        >
                            <li>
                                <a className="dropdown-item" href="/punto-venta/reimprimir">
                                    {currentLocation === '/punto-venta/reimprimir' ? 'Reimprimir (Actual)' : 'Reimprimir'} <FontAwesomeIcon icon={faPrint} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta">
                                    {currentLocation === '/punto-venta/punto-venta' ? 'Ventas (Actual)' : 'Ventas'} <FontAwesomeIcon icon={faCheckCircle} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/despacho">
                                    {currentLocation === '/punto-venta/despacho' ? 'Despacho (Actual)' : 'Despacho'} <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/devolucion">
                                    Devolución <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/abono-cliente">
                                {currentLocation === '/punto-venta/abono-cliente' ? 'Abono Cliente (Actual)' : 'Abono de cliente'} <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/movimientos-efectivo">
                                    Movimientos de efectivo <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/cierre-caja">
                                    Cierre de caja <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/recepcion-stock">
                                    Recepción de stock <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/maestros">
                                    Maestros <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/punto-venta/reportes">
                                    Reportes <FontAwesomeIcon icon={faArrowRight} />
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item text-danger" href="/">
                                    Cerrar punto de venta <FontAwesomeIcon icon={faTimesCircle} />
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
            <div className="main-content-with-navbar">
                {/* Main content goes here */}
            </div>
        </>
    );
};

export default PuntoVentaNavbar;
