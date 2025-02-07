import React from 'react';
import styles from './ExportarDatos.module.css';
import { useParams } from 'react-router-dom';

const ExportarDatos: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Exportar Datos</h1>
            <p>Esta es la página de exportación de datos.</p>
            <p>Estado actual: {client_id}</p>
        </div>
    );
};

export default ExportarDatos;