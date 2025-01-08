import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';
import { Link } from 'react-router-dom';
import styles from './ProductosServicios.module.css';

const ProductosServicios: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false); // Nuevo estado para manejar la búsqueda

    interface Product {
        nombre: string;
        sku: string;
        marca: { nombre: string };
        tipo_producto: { producto: string };
        control_stock: number;
        precio: number;
        permitir_venta_no_stock: number;
        control_series: number;
        permitir_venta_decimales: number;
        created_at: string;
        updated_at: string;
    }

    const observer = useRef<IntersectionObserver | null>(null);

    const lastProductElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loading || !hasMore) return; // Detener observación si no hay más datos
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setLoading(true); // Asegurarse de que solo se cargue una página a la vez
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.VITE_API_URL}/productos?page=${page}`);
                const data: Product[] = await response.json();

                setProducts(prevProducts => {
                    const existingSKUs = new Set(prevProducts.map(product => product.sku));
                    const filteredData = data.filter(product => !existingSKUs.has(product.sku));
                    return [...prevProducts, ...filteredData];
                });

                setHasMore(data.length > 0); // Si no hay más datos, finalizar paginación
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false); // Finalizar la carga
            }
        };

        fetchProducts();
    }, [page]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsFiltering(e.target.value !== ''); // Determina si hay búsqueda activa
    };

    const filteredProducts = isFiltering
        ? products.filter(product =>
              product.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : products;

    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Tipos de Producto', url: '/admin/tipos' },
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
                        onChange={handleSearch}
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
                    <button className={`btn btn-light`} disabled>Todos</button>
                    <button className={`btn btn-light`} disabled>Productos</button>
                    <button className={`btn btn-light`} disabled>Servicios</button>
                    <button className={`btn btn-light`} disabled>Packs</button>
                </div>

                <div className={styles.tableContainer}>
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
                            {filteredProducts.map((product, index) => {
                                if (filteredProducts.length === index + 1 && !isFiltering) {
                                    return (
                                        <tr ref={lastProductElementRef} key={product.sku}>
                                            <td>{product.nombre}</td>
                                            <td>{product.sku}</td>
                                            <td>{product.marca.nombre}</td>
                                            <td>{product.tipo_producto.producto}</td>
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
                                    );
                                } else {
                                    return (
                                        <tr key={product.sku}>
                                            <td>{product.nombre}</td>
                                            <td>{product.sku}</td>
                                            <td>{product.marca.nombre}</td>
                                            <td>{product.tipo_producto.producto}</td>
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
                                    );
                                }
                            })}
                        </tbody>
                    </table>

                    {loading && hasMore && !isFiltering && (
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {!hasMore && !isFiltering && (
                        <div className="text-center mt-3">
                            <p className="text-muted">Todos los datos han sido cargados.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductosServicios;
