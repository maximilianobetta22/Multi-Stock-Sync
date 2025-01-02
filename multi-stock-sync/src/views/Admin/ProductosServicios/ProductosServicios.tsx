import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

const ProductosServicios: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('todos');

    const products = [
        { name: 'Ejemplo Producto 1', status: 'Activo', brand: 'DEMO BSALE', type: 'producto' },
        { name: 'Ejemplo Producto 2', status: 'Activo', brand: 'DEMO BSALE', type: 'producto' },
        { name: 'Ejemplo Servicio 1', status: 'Activo', brand: 'DEMO BSALE', type: 'servicio' },
        { name: 'Pack 5 Fumo Fumos', status: 'Activo', brand: 'DEMO BSALE', type: 'pack' },
        { name: 'Peluche Fumo Fumos', status: 'Activo', brand: 'Sin Tipo', type: 'producto' },
    ];

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filter === 'todos' || product.type === filter)
    );

    return (
        <>
        <AdminNavbar />
        <div className="container mt-4">
            <h1 className="mb-3">Productos y Servicios</h1>
            
            <div className="d-flex mb-3">
                <input 
                    type="text" 
                    className="form-control me-2" 
                    placeholder="Buscar productos..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Crear
                </button>
            </div>

            <div className="btn-group mb-3" role="group">
                <button className={`btn btn-${filter === 'todos' ? 'primary' : 'light'}`} onClick={() => setFilter('todos')}>Todos</button>
                <button className={`btn btn-${filter === 'producto' ? 'primary' : 'light'}`} onClick={() => setFilter('producto')}>Productos</button>
                <button className={`btn btn-${filter === 'servicio' ? 'primary' : 'light'}`} onClick={() => setFilter('servicio')}>Servicios</button>
                <button className={`btn btn-${filter === 'pack' ? 'primary' : 'light'}`} onClick={() => setFilter('pack')}>Packs</button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Estado</th>
                        <th>Marca</th>
                        <th>Tipo de Producto</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((product, index) => (
                        <tr key={index}>
                            <td>
                                <FontAwesomeIcon icon={faStar} className="text-warning me-2" /> {product.name}
                            </td>
                            <td>
                                <span className="badge bg-success">{product.status}</span>
                            </td>
                            <td>{product.brand}</td>
                            <td>{product.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default ProductosServicios;
