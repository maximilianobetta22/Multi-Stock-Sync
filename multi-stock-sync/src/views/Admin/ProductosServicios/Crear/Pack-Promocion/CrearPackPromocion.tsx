import React from 'react';
import './CrearPackPromocion.css';

const CrearPackPromocion: React.FC = () => {
    return (
        <>
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Izquierdo</h1>
                        <p>Aquí va el contenido principal del lado izquierdo.</p>
                        <p>Componente: Pack promocion</p>
                    </div>
                </div>
                <div className="w-50 custom-gray p-3 d-flex flex-column">
                    <div className="v-25 p-3 d-flex align-items-center justify-content-center">
                        <div>
                            <h1>Contenido Superior Derecho</h1>
                            <p>Aquí va el contenido superior del lado derecho.</p>
                        </div>
                    </div>
                    <div className="v-25 p-3 d-flex align-items-center justify-content-center">
                        <div>
                            <h1>Contenido Inferior Derecho</h1>
                            <p>Aquí va el contenido inferior del lado derecho.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrearPackPromocion;