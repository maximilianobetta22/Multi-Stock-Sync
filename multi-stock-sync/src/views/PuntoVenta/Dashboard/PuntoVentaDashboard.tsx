import React, { useState } from 'react';
import './PuntoVentaDashboard.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faFileAlt, faBoxes, faUser } from '@fortawesome/free-solid-svg-icons';

const PuntoVentaDashboard = () => {
    const [selectedOption, setSelectedOption] = useState('destacados');
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');

    const renderSearchBar = () => {
        return (
            <div className="search-bar">
                <img src="/assets/img/cod_barras.png" alt="Código de barras" style={{ marginRight: '10px' }} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Ingresa aquí el producto o servicio"
                    onChange={(e) => {
                        setProductSearchQuery(e.target.value);
                        setSelectedOption('productos');
                    }}
                />
                <button className="invisible-button">
                    <div className="icon-circle-cyan">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                </button>
            </div>
        );
    };

    const renderResults = () => {
        switch (selectedOption) {
            case 'destacados':
                return <h1>Destacados</h1>;
            case 'borradores':
                return <h1>Borradores</h1>;
            case 'productos':
                return <h1>Resultados de Productos</h1>;
            case 'clientes':
                return <h1>Resultados de Clientes</h1>;
            case 'documentos':
                return <h1>Documentos</h1>;
            case 'stock':
                return <h1>Stock</h1>;
            case 'cliente':
                return <h1>Cliente</h1>;
            default:
                return <p>Seleccione una opción</p>;
        }
    };

    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-column main-container">
                
                <div className="d-flex flex-grow-1">
                    {/* Left side: Cart and products */}
                    <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                        <div>{renderSearchBar()}</div>
                    </div>
                    {/* Right side all imported components */}
                    <div className="w-50 custom-gray p-3 d-flex align-items-center justify-content-center">
                        <div>{renderResults()}</div>
                    </div>
                </div>

                {/* Footer */}
                <FooterActions
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    setClientSearchQuery={setClientSearchQuery}
                />
            </div>
        </>
    );
};

const FooterActions = ({
    selectedOption,
    setSelectedOption,
    setClientSearchQuery,
}: {
    selectedOption: string;
    setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
    setClientSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const handleClientSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setClientSearchQuery(query);
        setSelectedOption('clientes');
    };

    return (
        <div className="footer-actions">
            {/* Parte izquierda del footer */}
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
                                onChange={handleClientSearch}
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
};

export default PuntoVentaDashboard;
