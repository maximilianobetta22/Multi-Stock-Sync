import React, { useState } from 'react';
import './PuntoVentaDashboard.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faFileAlt, faBoxes, faUser } from '@fortawesome/free-solid-svg-icons';

const PuntoVentaDashboard = () => {
    const [selectedOption, setSelectedOption] = useState('destacados');

    const renderContent = () => {
        switch (selectedOption) {
            case 'destacados':
                return <p>xd</p>;
            case 'documentos':
                return <p>Contenido de Documentos</p>;
            case 'stock':
                return <p>Contenido de Stock</p>;
            case 'cliente':
                return <p>Contenido de Cliente</p>;
            default:
                return <p>Seleccione una opción</p>;
        }
    };

    return (
        <>
            <PuntoVentaNavbar />
            <div className="punto-venta-container">
                <div className="main-section">
                    <div className="search-bar">
                      <img src="/assets/img/cod_barras.png" alt="" style={{ marginRight: '10px' }} />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Ingresa aquí el producto o servicio"
                      />
                      <button className="search-button">
                        <FontAwesomeIcon icon={faSearch} /> {/* FontAwesome icon from NPM */}
                      </button>
                    </div>
                    <div className="content-area">{renderContent()}</div>
                </div>
                <div className="sidebar">
                    <button
                        className="sidebar-button"
                        onClick={() => setSelectedOption('destacados')}
                    >
                        <FontAwesomeIcon icon={faStar} />
                    </button>
                    <button
                        className="sidebar-button"
                        onClick={() => setSelectedOption('documentos')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                    </button>
                    <button
                        className="sidebar-button"
                        onClick={() => setSelectedOption('stock')}
                    >
                        <FontAwesomeIcon icon={faBoxes} />
                    </button>
                    <button
                        className="sidebar-button"
                        onClick={() => setSelectedOption('cliente')}
                    >
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                </div>
            </div>
            <FooterActions />
        </>
    );
};

const FooterActions = () => (
    <div className="footer-actions">
        <button className="footer-button">Cancelar</button>
        <button className="footer-button">Guardar Borrador</button>
        <div className="total-container">
            <span>Total: $0</span>
            <button className="pay-button">Pagar</button>
        </div>
    </div>
);

export default PuntoVentaDashboard;
