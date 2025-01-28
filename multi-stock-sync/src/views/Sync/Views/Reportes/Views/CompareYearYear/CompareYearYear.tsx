import React from 'react';
import { useParams } from 'react-router-dom';

const CompareYearYear: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();

    return (
        <div>
            <h1>Compare Year to Year</h1>
            <p>Client ID: {client_id}</p>
        </div>
    );
};

export default CompareYearYear;