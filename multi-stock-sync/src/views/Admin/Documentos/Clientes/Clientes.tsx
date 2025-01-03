import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './Clientes.css';

interface ClientesListProps {
    searchQuery: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClientesList: React.FC<ClientesListProps> = ({ searchQuery, handleSearchChange }) => {
    const [clientes] = useState([
        'Cliente 1',
        'Cliente 2',
        'Cliente 3',
        'Cliente 4',
        'Cliente 5'
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
                    <li key={index} className="clientes-list-item">{cliente}</li>
                ))}
            </ul>
        </div>
    );
};

export default ClientesList;
