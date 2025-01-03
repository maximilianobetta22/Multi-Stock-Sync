import React, { useState } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import './Documentos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import ClientesList from './Clientes/Clientes';
import ProductosServiciosList from './Productos/ProductosServiciosList';

const Documentos: React.FC = () => {
    const miniNavbarLinks = [
        { name: 'Buscar/Enviar', url: '#' },
        { name: 'Crédito', url: '#' }
    ];
    const miniNavbarDropdowns = [
        {
            name: 'Nuevo',
            options: [
                { name: 'En blanco', url: '#' },
                { name: 'A partir de existente', url: '#' },
                { name: 'Importando detalle', url: '#' },
                { name: 'Importando documentos', url: '#' }
            ]
        },
        {
            name: 'Devoluciones',
            options: [
                { name: 'Producto/Servicio', url: '#' },
                { name: 'Ajuste de Precio (Nota Crédito, no modifica stock)', url: '#' },
                { name: 'Ajuste de Precio (Nota Débito, no modifica stock)', url: '#' },
                { name: 'Ajuste de Texto', url: '#' },
                { name: 'Anular Devolución', url: '#' },
                { name: 'Anular Nota Débito, no modifica stock', url: '#' }
            ]
        },
        {
            name: 'Más opciones',
            options: [
                { name: 'Calendario', url: '#' },
                { name: 'Hito para Nuevo Documento', url: '#' },
                { name: 'Retiro de Abono', url: '#' },
                { name: 'Cierre de Mes', url: '#' },
                { name: 'Cesion', url: '#' },
                { name: 'Libros', url: '#' },
                { name: 'Importar Docs. Libros', url: '#' },
                { name: 'Editar Documento', url: '#' }

            ]
        }
    ];

    const [searchQueryClientes, setSearchQueryClientes] = useState('');
    const [searchQueryProductos, setSearchQueryProductos] = useState('');
    const [activeComponent, setActiveComponent] = useState('clientes');

    const handleSearchChangeClientes = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQueryClientes(event.target.value);
        setActiveComponent('clientes');
    };

    const handleSearchChangeProductos = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQueryProductos(event.target.value);
        setActiveComponent('productos');
    };

    const renderActiveComponent = () => {
        if (activeComponent === 'clientes') {
            return <ClientesList searchQuery={searchQueryClientes} handleSearchChange={handleSearchChangeClientes} />;
        } else if (activeComponent === 'productos') {
            return <ProductosServiciosList searchQuery={searchQueryProductos} handleSearchChange={handleSearchChangeProductos} />;
        }
    };

    return (
        <>
        
        <AdminNavbar links={miniNavbarLinks} dropdowns={miniNavbarDropdowns} />
            <div className="d-flex flex-grow-1 main-container">

                <div className="w-70 bg-light p-3 documentos-main-container d-flex flex-column">
                    <div className="documentos-search-container mb-4 d-flex justify-content-start align-items-center">
                        <div className="d-flex w-100">
                            <input
                                type="text"
                                placeholder="Buscar producto"
                                aria-label="Buscar producto"
                                className="documentos-search-input me-2"
                                value={searchQueryProductos}
                                onChange={handleSearchChangeProductos}
                            />
                            <button type="button" className="documentos-search-button">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                        <button className="btn documentos-glosa-button ms-3">+ Nueva Glosa</button>
                    </div>
                    <div className="documentos-table-container flex-grow-1">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cantidad </th>
                                    <th>Detalle</th>
                                    <th>$ / unidad</th>
                                    <th>% desc.</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>2</strong>, Peluche Fumo fumos</td>
                                    <td>Descripción del producto</td>
                                    <td>$1.200,00</td>
                                    <td>0%</td>
                                    <td>$2.400,00</td>
                                    <td>
                                        <button className="btn btn-sm btn-danger">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="documentos-footer-container mt-4 d-flex justify-content-between align-items-center">
                        <div className="documentos-client-search">
                            <input
                                type="text"
                                placeholder="Buscar cliente"
                                aria-label="Buscar cliente"
                                className="documentos-client-search-input me-2"
                                value={searchQueryClientes}
                                onChange={handleSearchChangeClientes}
                            />
                            <button type="button" className="documentos-client-search-button">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>

                        <span>Nr. Líneas: 5 / Tot. Ítems: 6</span>
                        <div className="d-flex align-items-center">
                            <select className="form-select documentos-select me-3">
                                <option>Boleta Manual</option>
                                <option>Factura</option>
                            </select>
                            <span>Total: $91.510</span>
                        </div>
                        <button className="btn btn-primary documentos-confirm-button">Confirmar</button>
                    </div>
                </div>

                <div className="w-30 custom-gray p-3 d-flex flex-column justify-content-between">
                    <div className="clientes-buttons-container d-flex justify-content-between">
                        <button className={`btn btn-${activeComponent === 'clientes' ? 'primary' : 'secondary'} me-2`} onClick={() => setActiveComponent('clientes')}>Clientes</button>
                        <button className={`btn btn-${activeComponent === 'productos' ? 'primary' : 'secondary'}`} onClick={() => setActiveComponent('productos')}>Productos</button>
                    </div>
                    <div className="clientes-list-container">
                        {renderActiveComponent()}
                    </div>
                </div>
            </div>
        
        </>
    );
};

export default Documentos;