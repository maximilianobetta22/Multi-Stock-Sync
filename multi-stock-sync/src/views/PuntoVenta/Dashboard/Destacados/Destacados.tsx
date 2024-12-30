import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faPlusCircle, faShoppingCart, faStar } from '@fortawesome/free-solid-svg-icons';
import './Destacados.css';

const Destacados: React.FC = () => {
    const productos = [
        'Ejemplo Producto 1 Variante 1 Lt',
        'Ejemplo Producto 1 Variante 2 Lt',
        'Ejemplo Producto 2 Variante L',
        'Ejemplo Producto 2 M',
        'Ejemplo Producto 2 Variante S',
        'Ejemplo Producto 3 Variante 1 Lt',
        'Peluche Fumo fumos'
    ];

    return (
        <div className="destacados-container">
            <h2 className="destacados-header">
                <FontAwesomeIcon icon={faStar} className="header-icon" /> Destacados y más Vendidos
            </h2>
            <ul className="productos-list">
                {productos.map((producto, index) => (
                    <li key={index} className="producto-item">
                        <span className="producto-nombre">{producto}</span>
                        <div className="producto-actions">
                            <FontAwesomeIcon icon={faDollarSign} className="producto-icon" />
                            <FontAwesomeIcon icon={faPlusCircle} className="producto-icon" />
                            <FontAwesomeIcon icon={faShoppingCart} className="producto-icon" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Destacados;
