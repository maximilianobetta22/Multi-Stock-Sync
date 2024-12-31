import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './DespachoContent.css';

const DespachoContent: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const documentos = [
        {
            id: 1,
            tipo: 'BOLETA MANUAL (no válido al SII)',
            numero: 'Nº 5',
            total: '$ 2.120',
            fecha: '30/12/2024',
            autor: 'Marcos Reyes',
        },
        {
            id: 2,
            tipo: 'FACTURA ELECTRÓNICA',
            numero: 'Nº 10',
            total: '$ 5.400',
            fecha: '28/12/2024',
            autor: 'Marcos Reyes',
        },
    ];

    const filteredDocumentos = documentos.filter((doc) =>
        `${doc.tipo} ${doc.numero}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="despacho-content">
            <div className="header-section">
                <h2 className="despacho-header">
                    <FontAwesomeIcon icon={faSearch} className="header-icon" /> Documentos Disponibles
                </h2>
                <div className="search-bar-despacho" style={{ marginLeft: '20px' }}>
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-despacho"
                    />
                    <button className="search-button-despacho">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
            </div>
            <ul className="documentos-list">
                {filteredDocumentos.length > 0 ? (
                    filteredDocumentos.map((doc) => (
                        <li key={doc.id} className="documento-item">
                            <div>
                                <span className="documento-tipo">{doc.tipo}</span>{' '}
                                <span className="documento-numero">{doc.numero}</span>
                                <p className="documento-detalles">
                                    {doc.total} / {doc.fecha} / {doc.autor}
                                </p>
                            </div>
                            <button className="documento-check">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="no-documento">Documento no encontrado</p>
                )}
            </ul>
        </div>
    );
};

export default DespachoContent;
