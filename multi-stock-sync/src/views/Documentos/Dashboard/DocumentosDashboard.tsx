import React from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './DocumentosDashboard.css';

const DocumentosDashboard: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="documentos-dashboard">
                <h1>Documentos</h1>
            </div>
        </>
    );
};

export default DocumentosDashboard;