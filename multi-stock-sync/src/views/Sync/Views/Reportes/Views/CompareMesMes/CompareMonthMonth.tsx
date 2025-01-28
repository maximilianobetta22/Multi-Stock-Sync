import React from 'react';
import { useParams } from 'react-router-dom';


const CompareMonthMonth: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    return (
        <div>
            <h1>Compare Mes a Mes</h1>
            <p>Esta es la página básica para comparar mes a mes.</p>
            <p>El cliente seleccionado es: {client_id}</p>
        </div>
    );
};

export default CompareMonthMonth;