// PuntoVentaDashboard.tsx

import React, { useState } from 'react';
import './PuntoVentaDashboard.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faFileAlt, faBoxes, faUser, faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

import BorradoresVenta from './BorradoresVenta/BorradoresVenta';
import Clientes from './Clientes/Clientes';
import Destacados from './Destacados/Destacados';
import ProductosServicios from './ProductosServicios/ProductosServicios';

interface Producto {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
}

const PuntoVentaDashboard = () => {
    const [selectedOption, setSelectedOption] = useState('destacados');
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [cart, setCart] = useState<Producto[]>([]);

    const handleAddToCart = (product: Producto) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);

            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [...prevCart, { ...product, cantidad: 1 }];
        });
    };

    const handleRemoveFromCart = (productId: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === productId && item.cantidad > 1
                        ? { ...item, cantidad: item.cantidad - 1 }
                        : item
                )
                .filter((item) => item.cantidad > 0)
        );
    };

    const handleRemoveAllFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
    };

    const renderCartTable = () => {
        return (
            <div className="cart-container">
                <table className="cart-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item) => (
                            <tr key={item.id}>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>${item.precio.toLocaleString()}</td>
                                <td>${(item.precio * item.cantidad).toLocaleString()}</td>
                                <td>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleRemoveFromCart(item.id)}
                                    >
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <button
                                        className="btn-action"
                                        onClick={() => handleRemoveAllFromCart(item.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="cart-total">
                    <strong>Total: ${calculateTotal().toLocaleString()}</strong>
                </div>
            </div>
        );
    };

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
                return <Destacados />;
            case 'borradores':
                return <BorradoresVenta />;
            case 'productos':
                return <ProductosServicios searchQuery={productSearchQuery} onAddToCart={handleAddToCart} />;
            case 'clientes':
                return <Clientes searchQuery={clientSearchQuery} setSearchQuery={setClientSearchQuery} />;
            case 'documentos':
                return <BorradoresVenta />;
            case 'stock':
                return <ProductosServicios searchQuery={productSearchQuery} onAddToCart={handleAddToCart} />;
            case 'cliente':
                return <Clientes searchQuery={clientSearchQuery} setSearchQuery={setClientSearchQuery} />;
            default:
                return <p>Seleccione una opción</p>;
        }
    };

    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-column main-container">
                <div className="d-flex flex-grow-1">
                    <div className="w-50 bg-light p-3">
                        <div>{renderSearchBar()}</div>
                        {renderCartTable()}
                    </div>
                    <div className="w-50 custom-gray p-3">
                        <div>{renderResults()}</div>
                    </div>
                </div>

                <FooterActions
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    setClientSearchQuery={setClientSearchQuery}
                    total={calculateTotal()}
                />
            </div>
        </>
    );
};

const FooterActions = ({
    selectedOption,
    setSelectedOption,
    setClientSearchQuery,
    total,
}: {
    selectedOption: string;
    setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
    setClientSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    total: number;
}) => {
    const handleClientSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setClientSearchQuery(query);
        setSelectedOption('clientes');
    };

    return (
        <div className="footer-actions">
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
                        <span className="total-amount">${total.toLocaleString()}</span>
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
