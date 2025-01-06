import React, { useState } from 'react';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import './AbonoCliente.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

const AbonoCliente: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [abonos, setAbonos] = useState<{ metodo: string; monto: number }[]>([]);
    const [monto, setMonto] = useState<number>(0);
    const [metodo, setMetodo] = useState('efectivo');
    const [observacion, setObservacion] = useState('');
    const [fechaAbono, setFechaAbono] = useState<Date | null>(new Date());

    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setMonto(Number(value));
    };

    const handleAgregarAbono = () => {
        if (monto > 0) {
            setAbonos([...abonos, { metodo, monto }]);
            setMonto(0);
        }
    };

    const handleEliminarAbono = (index: number) => {
        setAbonos(abonos.filter((_, i) => i !== index));
    };

    const handleGuardar = () => {
        alert('Datos guardados');
    };

    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-70 bg-light p-4 d-flex flex-row" style={{ gap: '20px' }}>
                    {/* Formulario de abonos */}
                    <div className="form-section" style={{ flex: '1', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-center mb-4">Cliente</h2>
                        <div className="d-flex mb-3">
                            <input
                                type="text"
                                placeholder="Buscar cliente"
                                className="form-control me-2"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                        <label className="form-label">Fecha del abono</label>
                        <DatePicker
                            selected={fechaAbono}
                            onChange={(date) => setFechaAbono(date)}
                            className="form-control mb-3"
                        />
                        <label className="form-label">Moneda</label>
                        <select className="form-select mb-3">
                            <option value="peso chileno">Peso Chileno</option>
                        </select>
                        <label className="form-label">Observación</label>
                        <textarea
                            className="form-control mb-3"
                            placeholder="Escribe una observación..."
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                        ></textarea>
                        <label className="form-label">Método de Pago</label>
                        <select
                            className="form-select mb-3"
                            value={metodo}
                            onChange={(e) => setMetodo(e.target.value)}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                        <label className="form-label">Monto Abono</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Ingresa el monto"
                            value={monto ? formatCLP(monto) : ''}
                            onChange={handleMontoChange}
                        />
                        <button
                            className="btn btn-success mb-4 w-100 agregar-abono-btn"
                            onClick={handleAgregarAbono}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} /> Agregar Abono
                        </button>
                    </div>
                    {/* Tabla de abonos */}
                    <div className="abonos-list" style={{ flex: '1', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h5 className="text-center">Lista de Abonos</h5>
                        {abonos.length > 0 ? (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Método</th>
                                        <th>Monto</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abonos.map((abono, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{abono.metodo}</td>
                                            <td>{formatCLP(abono.monto)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleEliminarAbono(index)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                <p className="text-muted">No hay abonos registrados</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-30 custom-gray p-4 d-flex flex-column">
                    <h2 className="text-center mb-4">Información del Cliente</h2>
                    <p className="text-center mb-3">Historial y detalles del cliente</p>
                    <button className="btn btn-primary mb-4 save-btn" onClick={handleGuardar}>Guardar</button>
                    <div className="client-info">
                        <p>Nombre: Cliente Ejemplo</p>
                        <p>Total Abonos: {formatCLP(abonos.reduce((acc, curr) => acc + curr.monto, 0))}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AbonoCliente;
