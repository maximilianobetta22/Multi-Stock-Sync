import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import 'react-datepicker/dist/react-datepicker.css';
import './BorradoresVenta.css';

const BorradoresVenta: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const borradores = [
        { id: 1, usuario: 'Reimu Hakurei', fecha: '01/01/2024' },
        { id: 2, usuario: 'Marisa Kirisame', fecha: '15/02/2024' },
        { id: 3, usuario: 'Sakuya Izayoi', fecha: '28/03/2024' },
    ];

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    return (
        <div className="borradores-venta-container">
            <h2 className="borradores-header">
                <FontAwesomeIcon icon={faCheckCircle} className="header-icon" /> Borradores de Venta
            </h2>

            
            <div className="filtrador-container">
                <div>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        className="fecha-input"
                    />
                </div>
                <div className="search-container">
                    <input type="text" placeholder="Buscar" className="search-input" />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            </div>

            <ul className="borradores-list">
                {borradores.map((borrador) => (
                    <li key={borrador.id} className="borrador-item">
                        <span className="borrador-info">
                            Nº {borrador.id} <span className="borrador-usuario">{borrador.usuario}</span>{' '}
                            {borrador.fecha}
                        </span>
                        <div className="borrador-actions">
                            <FontAwesomeIcon icon={faCheckCircle} className="borrador-icon check-icon" />
                            <FontAwesomeIcon icon={faTrash} className="borrador-icon trash-icon" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BorradoresVenta;
