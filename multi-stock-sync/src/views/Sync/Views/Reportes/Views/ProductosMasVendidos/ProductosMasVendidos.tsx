import React from 'react';

import { useParams } from 'react-router-dom';

const ProductosMasVendidos: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Productos Más Vendidos</h1>
            <p>Esta es la página de productos más vendidos.</p>
        </div>
    );
};

export default ProductosMasVendidos;