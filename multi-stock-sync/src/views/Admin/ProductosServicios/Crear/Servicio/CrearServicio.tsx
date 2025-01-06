import React from 'react';
import AdminNavbar from '../../../../../components/AdminNavbar/AdminNavbar';
import './CrearServicio.css';

const CrearServicio: React.FC = () => {
    return (
        <>
            <AdminNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Crear servicio</h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CrearServicio;