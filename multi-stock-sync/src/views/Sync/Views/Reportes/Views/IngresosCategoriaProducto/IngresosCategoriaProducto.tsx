import React from 'react';
import { useParams } from 'react-router-dom';

const IngresosCategoriaProducto: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Ingresos por Categoría de Producto</h1>
            <p>Esta es una vista básica para mostrar los ingresos por categoría de producto.</p>
        </div>
    );
};

export default IngresosCategoriaProducto;