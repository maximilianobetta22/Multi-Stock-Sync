import React from 'react';
import './Stock.css';

const Stock: React.FC = () => {
  return (
    <>
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <h1>Contenido Izquierdo</h1>
            <p>Aquí va el contenido principal del lado izquierdo.</p>
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

export default Stock;
