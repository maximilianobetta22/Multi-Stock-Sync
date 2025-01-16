import React from 'react';
import './Devolucion.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';

const Devolucion: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Izquierdo</h1>
                        <p>Aquí va el contenido principal del lado izquierdo.</p>
                    </div>
                    <div id="return">
                    <input 
                        type="text" 
                        placeholder="Código de barra" 
                        className="custom-input"
                    />
                        <span className="icon">
                        🔍
                        </span>
                    </div>
                    <div id="main_fotter">
                        <span id="total">
                            Nr.líneas:<b>0</b>/Tot.ítem: <b>0</b>
                        </span>
                        <div>
                            <label className="sl-impuesto">Neto</label>
                            <label className="sl-impuesto">Neto</label>
                            <label className="sl-impuesto">Neto</label>
                            <label className="sl-impuesto">Neto</label>
                        </div>
                    </div>
                </div>
                <div className="w-50 custom-gray p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Derecho</h1>
                        <p>Aquí va el contenido principal del lado derecho.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Devolucion;