import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './BorradoresVenta.css';

const BorradoresVenta: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const borradores = [
        { id: 1, usuario: 'Usuario 1', fecha: '01/01/2024' },
        { id: 2, usuario: 'Usuario 2', fecha: '15/02/2024' },
        { id: 3, usuario: 'Usuario 3', fecha: '28/03/2024' },
    ];

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredBorradores = borradores.filter((borrador) =>
        borrador.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="borradores-venta">
            <h2 className="borradores-header">
                <FontAwesomeIcon icon={faCheckCircle} className="header-icon" /> Borradores de Venta
            </h2>
            <div className="filters-container">
                <div className="borradores-bar">
                    <input
                        type="text"
                        placeholder="Buscar borradores"
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <ul className="productos-list">
                {filteredBorradores.length > 0 ? (
                    filteredBorradores.map((borrador) => (
                        <li key={borrador.id} className="borrador-item">
                            <span className="borrador-nombre">
                                Nº {borrador.id} - {borrador.usuario} - {borrador.fecha}
                            </span>
                            <div className="borrador-actions">
                                <FontAwesomeIcon icon={faCheckCircle} className="borrador-icon check-icon" />
                                <FontAwesomeIcon icon={faTrash} className="borrador-icon trash-icon" />
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="no-results">No se encontraron borradores</li>
                )}
            </ul>
        </div>
    );
};

export default BorradoresVenta;