import React, { useState, useEffect, useRef } from 'react';
import './RecepcionStock.css';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

const RecepcionStock: React.FC = () => {
    const [products, setProducts] = useState<{ sku: string; name: string; price: number; quantity: number }[]>([]);
    const [totalNet, setTotalNet] = useState(0);
    const [search, setSearch] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentType, setDocumentType] = useState('Sin documento');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addedProducts, setAddedProducts] = useState<{ sku: string; name: string; price: number; quantity: number }[]>([]);
    const [showProductList, setShowProductList] = useState(false);
    const productListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/productos`);
                if (!response.ok) {
                    throw new Error('Error fetching products');
                }
                const data = await response.json();
                const formattedData = data.map((product: any) => ({
                    sku: product.sku,
                    name: product.nombre,
                    price: product.precio,
                    quantity: 1
                }));
                setProducts(formattedData);
            } catch (error) {
                setError('No se pudieron cargar los productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddProduct = (product: any) => {
        if (!addedProducts.some((p: any) => p.sku === product.sku)) {
            const newProducts = [...addedProducts, { ...product, quantity: 1 }];
            setAddedProducts(newProducts);
            calculateNetTotal(newProducts);
        }
        setShowProductList(false);
    };

    const handleQuantityChange = (sku: string, quantity: number) => {
        const newProducts = addedProducts.map((p: any) =>
            p.sku === sku ? { ...p, quantity: quantity || 1 } : p
        );
        setAddedProducts(newProducts);
        calculateNetTotal(newProducts);
    };

    const calculateNetTotal = (products: any[]) => {
        const total = products.reduce((sum, product) => sum + product.quantity * product.price, 0);
        setTotalNet(total);
    };

    const handleRemoveProduct = (sku: string) => {
        const newProducts = addedProducts.filter((p: any) => p.sku !== sku);
        setAddedProducts(newProducts);
        calculateNetTotal(newProducts);
    };

    const handleSave = () => {
        alert('Productos guardados exitosamente');
    };

    const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentNumber(e.target.value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setShowProductList(true);
    };

    const handleOutsideClick = (e: MouseEvent) => {
        if (productListRef.current && !productListRef.current.contains(e.target as Node)) {
            setShowProductList(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <AdminNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div className="recepcion-stock-container bg-white p-4 rounded shadow">
                        <h1 className="mb-4">Recepción de Stock</h1>
                        <div className="d-flex mb-4">
                            <select
                                className="form-control mx-1"
                                style={{ width: '150px' }}
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                            >
                                <option value="Sin documento">Sin documento</option>
                                <option value="Factura">Factura</option>
                                <option value="Guía">Guía</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Número de documento"
                                className="form-control"
                                value={documentNumber}
                                onChange={handleDocumentNumberChange}
                            />
                        </div>

                        {loading && <p>Loading products...</p>}
                        {error && <p>{error}</p>}

                        <div className="mb-4 position-relative">
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                className="form-control"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            {showProductList && (
                                <div className="dropdown-overlay" ref={productListRef}>
                                    <ul className="list-group mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {filteredProducts.map((product) => (
                                            <li
                                                key={product.sku}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => handleAddProduct(product)}
                                            >
                                                {product.name} - {product.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="table-container mb-4">
                            <table className="table table-bordered">
                                <thead className="thead-light">
                                    <tr>
                                        <th>SKU</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>$/Unidad</th>
                                        <th>Subtotal</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {addedProducts.length > 0 ? (
                                        addedProducts.map((product: any) => (
                                            <tr key={product.sku}>
                                                <td>{product.sku}</td>
                                                <td>{product.name}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={product.quantity}
                                                        min="1"
                                                        onChange={(e) =>
                                                            handleQuantityChange(
                                                                product.sku,
                                                                parseInt(e.target.value, 10)
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>{product.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                                <td>{(product.quantity * product.price).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveProduct(product.sku)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                No hay productos agregados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Total Neto: {totalNet.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h5>
                            <button className="btn btn-primary" onClick={handleSave}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecepcionStock;
