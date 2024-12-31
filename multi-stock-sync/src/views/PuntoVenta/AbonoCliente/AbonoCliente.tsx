import React, { useState } from 'react';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import './AbonoCliente.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';

const AbonoCliente: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [abonos, setAbonos] = useState<{ metodo: string; monto: number }[]>([]);
    const [monto, setMonto] = useState<number>(0);
    const [metodo, setMetodo] = useState('efectivo');
    const [observacion, setObservacion] = useState('');

    const handleAgregarAbono = () => {
        if (monto > 0) {
            setAbonos([...abonos, { metodo, monto }]);
            setMonto(0);
        }
    };

    const handleEliminarAbono = (index: number) => {
        setAbonos(abonos.filter((_, i) => i !== index));
    };

    return (
        <>
            <PuntoVentaNavbar />
            <div className="abono-cliente-container">
                {/* Parte Izquierda */}
                <div className="abono-cliente-left">
                    <h2>Cliente</h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar cliente"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-button">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                    <label>Fecha del abono</label>
                    <input type="date" className="input-date" />
                    <label>Moneda</label>
                    <select className="select-moneda">
                        <option value="peso chileno">Peso Chileno</option>
                    </select>
                    <label>Observación</label>
                    <textarea
                        className="textarea-observacion"
                        placeholder="Escribe una observación..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                    ></textarea>
                    <label>Método de Pago</label>
                    <select
                        className="select-metodo"
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value)}
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                    </select>
                    <label>Monto Abono</label>
                    <input
                        type="text"
                        className="input-monto"
                        placeholder="Ingresa el monto"
                        value={monto}
                        onChange={(e) => setMonto(Number(e.target.value))}
                        pattern="\d*"
                        maxLength={11}
                    />
                    <div className="add-abono">
                        
                        <FontAwesomeIcon icon={faPlusCircle} onClick={handleAgregarAbono} />
                    </div>
                    <div className="abonos-list">
                        {abonos.length > 0 ? (
                            abonos.map((abono, index) => (
                                <div key={index} className="abono-item">
                                    {abono.metodo} (${abono.monto})
                                    <button onClick={() => handleEliminarAbono(index)}>Eliminar</button>
                                </div>
                            ))
                        ) : (
                            <p>No hay abonos registrados</p>
                        )}
                    </div>
                </div>
                {/* Parte Derecha */}
                <div className="abono-cliente-right">
                    <h2>Información del Cliente</h2>
                    <p>Historial y detalles del cliente</p>
                    <div className="client-info">
                        <p>Nombre: Cliente Ejemplo</p>
                        <p>Total Abonos: ${abonos.reduce((acc, curr) => acc + curr.monto, 0)}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AbonoCliente;
