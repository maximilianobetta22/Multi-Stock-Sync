import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faPlusCircle, faCheckCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import './Destacados.css';

const Destacados: React.FC = () => {
    const [productos] = useState<string[]>([
        'Ejemplo Producto 1 Variante 1 Lt',
        'Ejemplo Producto 2 Variante L',
        'Ejemplo Producto 2 M',
        'Ejemplo Producto 2 Variante S',
        'Ejemplo Producto 3 Variante 1 Lt',
        'Ejemplo Producto 4 Variante XL',
        'Ejemplo Producto 5 Variante M',
        'Ejemplo Producto 6 Variante S',
        'Ejemplo Producto 7 Variante L',
        'Ejemplo Producto 8 Variante 1 Lt',
    ]);

    return (
        <>
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
                            <FontAwesomeIcon icon={faCheckCircle} className="producto-icon" />
                        </div>
                    </li>
                ))}

            </ul>
        </>
    );
};

export default Destacados;
