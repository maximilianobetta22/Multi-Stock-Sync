import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './ProductosServiciosList.css';

interface ProductosServiciosListProps {
    searchQuery: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddProductToCart: (product: { name: string, price: number, quantity: number }) => void;
}

const ProductosServiciosList: React.FC<ProductosServiciosListProps> = ({ searchQuery, handleSearchChange, handleAddProductToCart }) => {
    const [productos] = useState([
        { name: 'Producto 1', price: 1200, quantity: 1 },
        { name: 'Producto 2', price: 1500, quantity: 1 },
        { name: 'Producto 3', price: 800, quantity: 1 },
        { name: 'Producto 4', price: 2000, quantity: 1 },
        { name: 'Producto 5', price: 500, quantity: 1 }
    ]);

    const filteredProductos = productos.filter(producto =>
        producto.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCLP = (amount: number) => {
        return `$${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <div className="productos-container">
            <h1>Lista de Productos</h1>
            <div className="productos-search-container">
                <input
                    type="text"
                    placeholder="Buscar producto"
                    aria-label="Buscar producto"
                    className="productos-search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <button type="button" className="productos-search-button">
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </div>
            <ul className="productos-list">
                {filteredProductos.map((producto, index) => (
                    <li key={index} className="productos-list-item">
                        {producto.name} - {formatCLP(producto.price)}
                        <button className="btn btn-primary ms-2" onClick={() => handleAddProductToCart(producto)}>Agregar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductosServiciosList;
