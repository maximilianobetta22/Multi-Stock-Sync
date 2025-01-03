import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import './ProductosServicios.css';

interface ProductosServiciosProps {
    searchQuery: string;
    onAddToCart: (product: { id: number; nombre: string; cantidad: number; precio: number }) => void;
}

const ProductosServicios: React.FC<ProductosServiciosProps> = ({ searchQuery, onAddToCart }) => {
    const productos = [
        { id: 1, nombre: 'Producto A', cantidad: 10, precio: 1000 },
        { id: 2, nombre: 'Producto B', cantidad: 5, precio: 2000 },
        { id: 3, nombre: 'Producto C', cantidad: 7, precio: 1500 },
        { id: 4, nombre: 'Producto D', cantidad: 2, precio: 500 },
    ];

    const [filteredProductos, setFilteredProductos] = useState(productos);

    useEffect(() => {
        if (searchQuery) {
            setFilteredProductos(
                productos.filter((producto) =>
                    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProductos(productos);
        }
    }, [searchQuery]);

    return (
        <div className="productos-container">
            <ul className="productos-list">
                {filteredProductos.map((producto) => (
                    <li key={producto.id} className="producto-item">
                        <span>{producto.nombre}</span>
                        <span>${producto.precio.toLocaleString()}</span>
                        <button
                            className="btn-add-to-cart"
                            onClick={() => onAddToCart(producto)}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} /> Agregar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductosServicios;
