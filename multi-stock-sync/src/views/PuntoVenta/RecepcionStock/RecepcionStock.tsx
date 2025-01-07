import React from 'react';
import './RecepcionStock.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';

const RecepcionStock: React.FC = () => {
  return (
    <>
      <PuntoVentaNavbar />
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <h1>Recepcion stock</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecepcionStock;
