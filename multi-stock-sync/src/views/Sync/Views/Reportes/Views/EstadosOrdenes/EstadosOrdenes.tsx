import React from 'react';
import { useParams } from 'react-router-dom';

const EstadosOrdenes: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Estados de Órdenes</h1>
            <p>Esta es la página de estados de órdenes.</p>
            <p>Estado actual: {client_id}</p>
        </div>
    );
};

export default EstadosOrdenes;