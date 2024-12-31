import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import './Reimprimir.css';

const Reimprimir: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [searchText, setSearchText] = useState('');

    const documentos = [
        { id: 1, titulo: 'BOLETA MANUAL Nº 5', monto: '$2.120', fecha: '31/12/2024', usuario: 'Marcos Reyes' },
        { id: 2, titulo: 'FACTURA ELECTRÓNICA Nº 10', monto: '$5.400', fecha: '30/12/2024', usuario: 'Marcos Reyes' },
        { id: 3, titulo: 'GUIA DE DESPACHO MANUAL Nº 3', monto: '$890', fecha: '31/12/2024', usuario: 'Marcos Reyes' },
    ];

    const filteredDocuments = documentos.filter((doc) => {
        const isMatchingDate =
            selectedDate && doc.fecha === selectedDate.toLocaleDateString('en-GB'); // use en-GB to get dd/mm/yyyy format
        const isMatchingSearch = doc.titulo.toLowerCase().includes(searchText.toLowerCase());
        return isMatchingDate && isMatchingSearch;
    });

    return (
        <>
            <PuntoVentaNavbar />
            <div className="reimprimir-container">
                <div className="main-section">
                    {/* Add cart items later */}
                </div>
                <div className="sidebar">
                    <h2 className="sidebar-title">
                        <FontAwesomeIcon icon={faFileAlt} className="icon" /> Documentos Disponibles
                    </h2>
                    <div className="sidebar-filters">
                        <div className="date-picker-container">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="date-picker-input"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="documentos-resultados">
                        {filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc) => (
                                <div key={doc.id} className="documento-item">
                                    <div className="documento-info">
                                        <h4>{doc.titulo}</h4>
                                        <p>
                                            {doc.monto} / {doc.fecha} / {doc.usuario}
                                        </p>
                                    </div>
                                    <button className="reimprimir-btn" style={{ marginLeft: '20px' }}>
                                        <FontAwesomeIcon icon={faFileAlt} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-records">Sin Registros</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reimprimir;
