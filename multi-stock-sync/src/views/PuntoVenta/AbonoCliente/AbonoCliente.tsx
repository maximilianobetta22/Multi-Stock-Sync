import React, { useState } from 'react';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import Clientes from '../Dashboard/Clientes/Clientes';
import './AbonoCliente.css';

const AbonoCliente: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <PuntoVentaNavbar />
            <div className="abono-cliente-container">
                <div className="abono-cliente-left">
                    <h2>Realizar Abono</h2>
                    <p>Formulario para registrar un nuevo abono.</p>
                </div>
                <div className="abono-cliente-right">
                    <h2>Información del Cliente</h2>
                    <p>Esta sección contiene los datos del cliente y su historial de abonos.</p>
                    <Clientes searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
            </div>
        </>
    );
};

export default AbonoCliente;
