import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './ClientesModal.css';

const ClientesModal: React.FC<{ show: boolean, handleClose: () => void, selectedClient: any }> = ({ show, handleClose, selectedClient }) => {
    return (
        <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none', justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                        <button type="button" className="close" onClick={handleClose} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
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
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            Guardar <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientesModal;
