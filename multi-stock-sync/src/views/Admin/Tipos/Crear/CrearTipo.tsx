import React from 'react';
import styles from './CrearTipo.module.css';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';

const CrearTipo: React.FC = () => {

    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Tipos de Producto', url: '/admin/tipos' },
        { name: 'Config. Masiva', url: '/admin/config-masiva' },
        { name: 'Listas de Precio', url: '/admin/listas-de-precio' }
    ];
    
    return (
        <>

            

            <AdminNavbar links={miniNavbarLinks} />
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

export default CrearTipo;
