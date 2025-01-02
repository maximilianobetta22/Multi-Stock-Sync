import React from 'react';
import './Devolucion.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';

const Devolucion: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-column min-vh-100 main-content-with-navbar">
                <div className="d-flex flex-grow-1">
                    
                    <div className="w-55 bg-light p-3">
                        <h1>Contenido Izquierdo</h1>
                        <p>Aquí va el contenido principal del lado izquierdo.</p>
                    </div>

                    
                    <div className="w-45 custom-gray p-3">
                        <h1>Contenido Derecho</h1>
                        <p>Aquí va el contenido principal del lado derecho.</p>
                    </div>
                </div>

            </div>

        </>
    );
};

export default Devolucion;
