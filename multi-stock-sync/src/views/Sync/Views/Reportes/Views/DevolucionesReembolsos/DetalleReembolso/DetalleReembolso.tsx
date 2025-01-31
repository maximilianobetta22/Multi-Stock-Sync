import React from 'react';
import { useParams } from 'react-router-dom';

const DetalleReembolso: React.FC = () => {
    const { order_id } = useParams<{ order_id: string }>();

    return (
        <div>
            <h1>Detalle de Reembolso</h1>
            <p>Order ID: {order_id}</p>
        </div>
    );
};

export default DetalleReembolso;