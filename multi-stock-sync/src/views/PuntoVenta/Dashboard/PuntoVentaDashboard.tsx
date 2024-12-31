import React, { useState } from 'react';
import './PuntoVentaDashboard.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import Destacados from './Destacados/Destacados';
import BorradoresVenta from './BorradoresVenta/BorradoresVenta';
import ProductosServicios from './ProductosServicios/ProductosServicios';
import Clientes from './Clientes/Clientes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faFileAlt, faBoxes, faUser } from '@fortawesome/free-solid-svg-icons';

const PuntoVentaDashboard = () => {
    const [selectedOption, setSelectedOption] = useState('destacados');
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');

    /**
     * Renders the content based on the selected option.
     *
     * @returns {JSX.Element} The content to be rendered.
     *
     * The following cases are for the search queries:
     * - 'productos': Renders <ProductosServicios /> with productSearchQuery.
     * - 'clientes': Renders <Clientes /> with clientSearchQuery.
     * - 'stock': Renders <ProductosServicios /> with productSearchQuery.
     * - 'cliente': Renders <Clientes /> with clientSearchQuery.
     *
     * The following cases are for the buttons:
     * - 'destacados': Renders <Destacados />.
     * - 'borradores': Renders <BorradoresVenta />.
     * - 'documentos': Renders <BorradoresVenta />.
     *
     * If no case matches, it returns a default message prompting the user to select an option.
     */
    
    const renderContent = () => {
        switch (selectedOption) {
            case 'destacados':
                return <Destacados />;
            case 'borradores':
                return <BorradoresVenta />;
            case 'productos':
                return <ProductosServicios searchQuery={productSearchQuery} />;
            case 'clientes':
                return <Clientes searchQuery={clientSearchQuery} />;
            case 'documentos':
                return <BorradoresVenta />; 
            case 'stock':
                return <ProductosServicios searchQuery={productSearchQuery} />; // Assuming 'stock' should render 'ProductosServicios'
            case 'cliente':
                return <Clientes searchQuery={clientSearchQuery} />; // Assuming 'cliente' should render 'Clientes'
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
                            onChange={(e) => {
                                setProductSearchQuery(e.target.value);
                                setSelectedOption('productos');
                            }}
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
            <FooterActions
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                setClientSearchQuery={setClientSearchQuery}
            />
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
};

export default PuntoVentaDashboard;
