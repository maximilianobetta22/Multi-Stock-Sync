import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';
import { Link } from 'react-router-dom';
import styles from './ProductosServicios.module.css';

const ProductosServicios: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('todos');

    const products = [
        {
            nombre: 'Peluche FumoFumos edicion limitada',
            estado: 'Activo',
            marca: 'Sin Marca',
            tipo_producto: 'No especificado',
            sku: 'PEL-7894',
            precio: '9990.00',
            permitir_venta_no_stock: 0,
            control_series: 1,
            permitir_venta_decimales: 0,
            created_at: '2025-01-08T16:40:38.000000Z',
            updated_at: '2025-01-08T16:40:38.000000Z',
            stock: null
        },
        { name: 'Ejemplo Producto 1', status: 'Activo', brand: 'DEMO BSALE', type: 'producto', control_stock: 0 },
        { name: 'Ejemplo Producto 2', status: 'Activo', brand: 'DEMO BSALE', type: 'producto', control_stock: 0 },
        { name: 'Ejemplo Servicio 1', status: 'Activo', brand: 'DEMO BSALE', type: 'servicio', control_stock: 0 },
        { name: 'Pack 5 Fumo Fumos', status: 'Activo', brand: 'DEMO BSALE', type: 'pack', control_stock: 0 },
        { name: 'Peluche Fumo Fumos', status: 'Activo', brand: 'Sin Tipo', type: 'producto', control_stock: 0 },
    ];

    const filteredProducts = products.filter(product => 
        product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filter === 'todos' || product.tipo_producto === filter)
    );

    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Config. Masiva', url: '/admin/config-masiva' },
        { name: 'Listas de Precio', url: '/admin/listas-de-precio' }
    ];
    

    return (
        <>
        <AdminNavbar links={miniNavbarLinks} />
        <div className={`container ${styles.container}`}>
            <h1 className={styles.header}>Productos y Servicios</h1>
            
            <div className={styles.searchBar}>
                <input 
                    type="text" 
                    className={`form-control ${styles.searchInput}`} 
                    placeholder="Buscar productos..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <div className="dropdown">
                    <button className={`btn btn-multistock dropdown-toggle ${styles.dropdownButton}`} type="button" id="crearDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <FontAwesomeIcon icon={faPlus} /> Crear
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="crearDropdown">
                        <li><Link className="dropdown-item" to="/admin/productos-servicios/crear/producto">Producto</Link></li>
                        <li><Link className="dropdown-item" to="/admin/productos-servicios/crear/servicio">Servicio</Link></li>
                        <li><Link className="dropdown-item" to="/admin/productos-servicios/crear/pack-promocion">Pack/Promoción</Link></li>
                    </ul>
                </div>
            </div>

            <div className={`btn-group ${styles.filterButtons}`} role="group">
                <button className={`btn btn-${filter === 'todos' ? 'multistock' : 'light'}`} onClick={() => setFilter('todos')}>Todos</button>
                <button className={`btn btn-${filter === 'producto' ? 'multistock' : 'light'}`} onClick={() => setFilter('producto')}>Productos</button>
                <button className={`btn btn-${filter === 'servicio' ? 'multistock' : 'light'}`} onClick={() => setFilter('servicio')}>Servicios</button>
                <button className={`btn btn-${filter === 'pack' ? 'multistock' : 'light'}`} onClick={() => setFilter('pack')}>Packs</button>
            </div>

            <table className={`table ${styles.table}`}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>SKU</th>
                        <th>Marca</th>
                        <th>Tipo</th>
                        <th>Control Stock</th>
                        <th>Precio</th>
                        <th>Permitir Venta Sin Stock</th>
                        <th>Control Series</th>
                        <th>Permitir Venta Decimales</th>
                        <th>Creado En</th>
                        <th>Actualizado En</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((product, index) => (
                        <tr key={index}>
                            <td>{product.nombre}</td>
                            <td>{product.sku}</td>
                            <td>{product.marca}</td>
                            <td>{product.tipo_producto}</td>
                            <td>
                                <input type="checkbox" checked={product.control_stock === 1} readOnly />
                            </td>
                            <td>{product.precio}</td>
                            <td>
                                <input type="checkbox" checked={product.permitir_venta_no_stock === 1} readOnly />
                            </td>
                            <td>
                                <input type="checkbox" checked={product.control_series === 1} readOnly />
                            </td>
                            <td>
                                <input type="checkbox" checked={product.permitir_venta_decimales === 1} readOnly />
                            </td>
                            <td>{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>{product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <button className="btn btn-secondary btn-sm me-2">Editar</button>
                                <button className="btn btn-danger btn-sm mt-2">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default ProductosServicios;
