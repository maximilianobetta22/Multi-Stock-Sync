import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './ClientesList.css';

interface ClientesListProps {
    searchQuery: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleAssignClient: (client: string) => void;
}

const ClientesList: React.FC<ClientesListProps> = ({ searchQuery, handleSearchChange, handleAssignClient }) => {
    const [clientes] = useState([
        'Juan Pérez',
        'María García',
        'Carlos López',
        'Ana Martínez',
        'Luis Rodríguez'
    ]);

    const filteredClientes = clientes.filter(cliente =>
        cliente.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="clientes-container">
            <h1>Lista de Clientes</h1>
            <div className="clientes-search-container">
                <input
                    type="text"
                    placeholder="Buscar cliente"
                    aria-label="Buscar cliente"
                    className="clientes-search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <button type="button" className="clientes-search-button">
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </div>
            <ul className="clientes-list">
                {filteredClientes.map((cliente, index) => (
                    <li key={index} className="clientes-list-item">
                        {cliente}
                        <button className="btn btn-primary ms-2" onClick={() => handleAssignClient(cliente)}>Asignar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientesList;
