import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './ProductosServiciosList.css';

interface ProductosServiciosListProps {
    searchQuery: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductosServiciosList: React.FC<ProductosServiciosListProps> = ({ searchQuery, handleSearchChange }) => {
    const [productos] = useState([
        'Producto 1',
        'Producto 2',
        'Producto 3',
        'Producto 4',
        'Producto 5'
    ]);

    const filteredProductos = productos.filter(producto =>
        producto.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <li key={index} className="productos-list-item">{producto}</li>
                ))}
            </ul>
        </div>
    );
};

export default ProductosServiciosList;
