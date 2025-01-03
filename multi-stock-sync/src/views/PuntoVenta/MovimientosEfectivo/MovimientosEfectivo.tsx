import React from 'react';
import './MovimientosEfectivo.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';

const MovimientosEfectivo: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
                <div className="p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Centralizado</h1>
                        <p>Aquí va todo el contenido en el centro</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MovimientosEfectivo;
