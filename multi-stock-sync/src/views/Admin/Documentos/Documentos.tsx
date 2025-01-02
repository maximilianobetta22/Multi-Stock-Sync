import React from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Documentos.css';

const Documentos: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="documentos-dashboard">
                <h1>Documentos</h1>
            </div>
        </>
    );
};

export default Documentos;