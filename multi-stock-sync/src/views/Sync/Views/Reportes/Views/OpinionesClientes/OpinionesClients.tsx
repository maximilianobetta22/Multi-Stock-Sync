import React from 'react';
import { useParams } from 'react-router-dom';

const OpinionesClientes: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Opiniones de Clientes</h1>
            <p>Esta es la página de opiniones de clientes.</p>
        </div>
    );
};

export default OpinionesClientes;