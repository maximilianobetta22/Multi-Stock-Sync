import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faCheckCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import './Clientes.css';

const Clientes: React.FC<{ searchQuery: string, setSearchQuery: React.Dispatch<React.SetStateAction<string>> }> = ({ searchQuery, setSearchQuery }) => {
    const [isNewClient, setIsNewClient] = useState(false); // Change to search or form
    const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null); // New state for selected client

    const clientes = [
        { id: 1, nombre: 'Marcos Reyes' },
        { id: 2, nombre: 'Cliente Ejemplo' },
    ];

    useEffect(() => {
        if (searchQuery) {
            const filtered = clientes.filter((cliente) =>
                cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredClientes(filtered);
        } else {
            setFilteredClientes([]);
        }
    }, [searchQuery]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query) {
            const filtered = clientes.filter((cliente) =>
                cliente.nombre.toLowerCase().includes(query)
            );
            setFilteredClientes(filtered);
        } else {
            setFilteredClientes([]);
        }
    };

    const handleEditClick = (cliente: any) => {
        setSelectedClient(cliente);
        setIsNewClient(true);
    };

    return (
        <div className={`clientes-container ${isNewClient ? 'nuevo-cliente-form' : ''}`}>
            {isNewClient ? (
                // Nuevo cliente form
                <div className="nuevo-cliente-form">
                    <h2 className="clientes-header">
                        <FontAwesomeIcon icon={faUser} className="header-icon" /> {selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <form className="formulario">
                        <label>
                            Tipo de Cliente
                            <select>
                                <option>empresa</option>
                                <option>persona</option>
                            </select>
                        </label>
                        <label>
                            Cliente Extranjero
                            <select>
                                <option>no</option>
                                <option>sí</option>
                            </select>
                        </label>
                        <label>Rut<input type="text" /></label>
                        <label>Razón Social<input type="text" /></label>
                        <label>Giro<input type="text" /></label>
                        <label>Nombres<input type="text" /></label>
                        <label>Apellidos<input type="text" /></label>
                        <label>Dirección<input type="text" /></label>
                        <label>Comuna<input type="text" /></label>
                        <label>Ciudad<input type="text" /></label>
                        <label>Región<input type="text" /></label>
                        <div className="form-buttons">
                            <button
                                type="button"
                                className="cancelar-button"
                                onClick={() => setIsNewClient(false)}
                            >
                                cancelar
                            </button>
                            <button type="submit" className="guardar-button">
                                GUARDAR <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // Cliente finder
                <>
                    <h2 className="clientes-header">
                        <FontAwesomeIcon icon={faUser} className="header-icon" /> Clientes
                    </h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar cliente"
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    </div>
                    <ul className="clientes-list">
                        {searchQuery && filteredClientes.length > 0 ? (
                            filteredClientes.map((cliente) => (
                                <li key={cliente.id} className="cliente-item">
                                    {cliente.nombre}
                                    <div className="cliente-actions">
                                        <FontAwesomeIcon icon={faEdit} className="cliente-icon" onClick={() => handleEditClick(cliente)} />
                                        <FontAwesomeIcon icon={faCheckCircle} className="cliente-icon" />
                                    </div>
                                </li>
                            ))
                        ) : searchQuery ? (
                            <li className="no-results">Cliente no encontrado.</li>
                        ) : null}
                    </ul>
                    <button
                        className="nuevo-cliente-button"
                        onClick={() => setIsNewClient(true)}
                    >
                        NUEVO <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                </>
            )}
        </div>
    );
};

export default Clientes;
