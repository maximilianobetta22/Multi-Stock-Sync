import React from 'react';
import styles from './ListarTipos.module.css';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';

const ListarTipos: React.FC = () => {

    const miniNavbarLinks = [
        { name: 'Link 1', url: '#' },
        { name: 'Link 2', url: '#' },
        { name: 'Link 3', url: '#' }
    ];
    const miniNavbarDropdowns = [
        {
            name: 'Dropdown 1',
            options: [
                { name: 'PuntoVenta', url: '#' },
                { name: 'Opción 2', url: '#' },
                { name: 'Opción 3', url: '#' },
                { name: 'Opción 4', url: '#' },
                
            ]
        },
        {
            name: 'Dropdown 2',
            options: [
                { name: 'Opción 3', url: '#' }
            ]
        }
    ];

    return (
        <>

            

            <AdminNavbar links={miniNavbarLinks} dropdowns={miniNavbarDropdowns} />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Izquierdo</h1>
                        <p>Aquí va el contenido principal del lado izquierdo.</p>
                    </div>
                </div>
                <div className="w-50 custom-gray p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Derecho</h1>
                        <p>Aquí va el contenido principal del lado derecho.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListarTipos;
