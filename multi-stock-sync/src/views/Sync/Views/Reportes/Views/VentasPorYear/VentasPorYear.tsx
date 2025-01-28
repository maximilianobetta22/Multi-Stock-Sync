import React from 'react';
import { useParams } from 'react-router-dom';

const VentasPorYear: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Ventas Por Año</h1>
            <p>Client ID: {client_id}</p>
        </div>
    );
};

export default VentasPorYear;