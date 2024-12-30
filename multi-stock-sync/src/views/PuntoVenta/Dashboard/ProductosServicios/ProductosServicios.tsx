import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDollarSign, faPlusCircle, faShoppingCart, faThLarge } from '@fortawesome/free-solid-svg-icons';
import './ProductosServicios.css';

const ProductosServicios: React.FC = () => {
    const productos = [
        { id: 1, nombre: 'Peluche Fumo fumos', cantidad: 3 },
        { id: 2, nombre: 'Producto A', cantidad: 10 },
        { id: 3, nombre: 'Producto B', cantidad: 5 },
        { id: 4, nombre: 'Producto C', cantidad: 7 },
        { id: 5, nombre: 'Producto D', cantidad: 2 },
        { id: 6, nombre: 'Producto E', cantidad: 1 },
        { id: 7, nombre: 'Producto F', cantidad: 4 },
        { id: 8, nombre: 'Producto G', cantidad: 6 },
        { id: 9, nombre: 'Producto H', cantidad: 9 },
        { id: 10, nombre: 'Producto I', cantidad: 8 }
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProductos, setFilteredProductos] = useState<any[]>([]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query) {
            const filtered = productos.filter((producto) =>
                producto.nombre.toLowerCase().includes(query)
            );
            setFilteredProductos(filtered);
        } else {
            setFilteredProductos([]);
        }
    };

    return (
        <div className="productos-container">
            <h2 className="productos-header">
                <FontAwesomeIcon icon={faThLarge} className="header-icon" /> Productos/Servicios
            </h2>

            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Ingresa aquí el producto o servicio"
                    className="search-input"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>

            
            <ul className="productos-list">
                {searchQuery && filteredProductos.length > 0 ? (
                    filteredProductos.map((producto) => (
                        <li key={producto.id} className="producto-item">
                            <span className="producto-nombre">{producto.nombre}</span>
                            <span className="producto-cantidad">({producto.cantidad})</span>
                            <div className="producto-actions">
                                <FontAwesomeIcon icon={faDollarSign} className="producto-icon" />
                                <FontAwesomeIcon icon={faPlusCircle} className="producto-icon" />
                                <FontAwesomeIcon icon={faShoppingCart} className="producto-icon" />
                            </div>
                        </li>
                    ))
                ) : searchQuery ? (
                    <li className="no-results">Producto o servicio no se encuentra.</li>
                ) : null}
            </ul>
        </div>
    );
};

export default ProductosServicios;
