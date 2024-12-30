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
                return <p>Contenido de destacados</p>;
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
                        <img src="/assets/img/cod_barras.png" alt="Código de barras" style={{ marginRight: '10px' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Ingresa aquí el producto o servicio"
                        />
                        <button className="search-button">
                            <div className="icon-circle-cyan">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </button>
                    </div>
                </div>
                <div className="sidebar">{renderContent()}</div>
            </div>
            <FooterActions selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
        </>
    );
};

const FooterActions = ({ selectedOption, setSelectedOption }: { selectedOption: string, setSelectedOption: React.Dispatch<React.SetStateAction<string>> }) => (
    <div className="footer-actions">
        {/* Left side footer */}
        <div className="footer-left">
            <div className="footer-top">
                <div className="client-search">
                    <label htmlFor="client-search-input" className="client-label">Cliente:</label>
                    <div className="client-search-bar">
                        <input
                            id="client-search-input"
                            type="text"
                            className="client-search-input"
                            placeholder="Buscar cliente"
                        />
                        <button className="client-search-button">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                </div>
                <div className="total-display">
                    <span>Total: </span>
                    <span className="total-amount">$0</span>
                </div>
            </div>
            <div className="footer-bottom">
                <button className="footer-gray-button">Cancelar</button>
                <button className="footer-gray-button">Guardar Borrador</button>
                <button className="pay-button">Pagar</button>
            </div>
        </div>

        {/* Right side footer */}
        <div className="footer-right">
            <button
                className={`sidebar-button ${selectedOption === 'destacados' ? 'active' : ''}`}
                onClick={() => setSelectedOption('destacados')}
            >
                <div className="icon-circle">
                    <FontAwesomeIcon icon={faStar} />
                </div>
            </button>
            <button
                className={`sidebar-button ${selectedOption === 'documentos' ? 'active' : ''}`}
                onClick={() => setSelectedOption('documentos')}
            >
                <div className="icon-circle">
                    <FontAwesomeIcon icon={faFileAlt} />
                </div>
            </button>
            <button
                className={`sidebar-button ${selectedOption === 'stock' ? 'active' : ''}`}
                onClick={() => setSelectedOption('stock')}
            >
                <div className="icon-circle">
                    <FontAwesomeIcon icon={faBoxes} />
                </div>
            </button>
            <button
                className={`sidebar-button ${selectedOption === 'cliente' ? 'active' : ''}`}
                onClick={() => setSelectedOption('cliente')}
            >
                <div className="icon-circle">
                    <FontAwesomeIcon icon={faUser} />
                </div>
            </button>
        </div>
    </div>
);

export default PuntoVentaDashboard;
