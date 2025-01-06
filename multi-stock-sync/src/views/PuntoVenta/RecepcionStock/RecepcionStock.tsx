import React, { useState, useEffect, useRef } from 'react';
import './RecepcionStock.css';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

const RecepcionStock: React.FC = () => {
    const [products, setProducts] = useState<{ sku: string; name: string; price: number; quantity: number }[]>([]); // Added products
    const [totalNet, setTotalNet] = useState(0);
    const [search, setSearch] = useState(''); 
    const dropdownRef = useRef<HTMLDivElement>(null);

    const availableProducts = [
        { sku: '1735310770200', name: 'Peluche Fumo fumos', price: 1200 },
        { sku: '1735310770201', name: 'Camiseta Algodón', price: 500 },
        { sku: '1735310770202', name: 'Taza de Cerámica', price: 300 },
        { sku: '1735310770203', name: 'Cuaderno A5', price: 150 },
        { sku: '1735310770204', name: 'Bolígrafo Azul', price: 50 },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Add product
    const handleAddProduct = (product: any) => {
        if (!products.some((p: any) => p.sku === product.sku)) {
            const newProducts = [...products, { ...product, quantity: 1 }];
            setProducts(newProducts);
            calculateNetTotal(newProducts);
        }
        setSearch(''); // Clean search after adding product
    };
    

    // Update table
    const handleQuantityChange = (sku: string, quantity: number) => {
        const newProducts = products.map((p: any) =>
            p.sku === sku ? { ...p, quantity: quantity || 1 } : p
        );
        setProducts(newProducts);
        calculateNetTotal(newProducts);
    };

    // Neto value calculation
    const calculateNetTotal = (products: any[]) => {
        const total = products.reduce((sum, product) => sum + product.quantity * product.price, 0);
        setTotalNet(total);
    };

    // Delete from table
    const handleRemoveProduct = (sku: string) => {
        const newProducts = products.filter((p: any) => p.sku !== sku);
        setProducts(newProducts);
        calculateNetTotal(newProducts);
    };

    // Save product (update in future)
    const handleSave = () => {
        alert('Productos guardados exitosamente');
    };

    return (
        <>
            <AdminNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div className="recepcion-stock-container bg-white p-4 rounded shadow">
                        <h1 className="mb-4">Recepción de Stock</h1>


                        <div className="mb-4 position-relative" ref={dropdownRef}>
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <ul className="list-group mt-2 dropdown-overlay">
                                    {availableProducts
                                        .filter((product) =>
                                            product.name.toLowerCase().includes(search.toLowerCase())
                                        )
                                        .map((product) => (
                                            <li
                                                key={product.sku}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => handleAddProduct(product)}
                                            >
                                                {product.name} - ${product.price.toLocaleString()}
                                            </li>
                                        ))}
                                </ul>
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
                                    {products.length > 0 ? (
                                        products.map((product: any) => (
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
                                                <td>${product.price.toLocaleString()}</td>
                                                <td>${(product.quantity * product.price).toLocaleString()}</td>
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
                            <h5>Total Neto: ${totalNet.toLocaleString()}</h5>
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
