import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';
import styles from './ListarTipos.module.css';

const ListarTipos: React.FC = () => {
    interface Tipo {
        id: number;
        producto: string;
        created_at: string;
        updated_at: string;
    }

    const [tipos, setTipos] = useState<Tipo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.VITE_API_URL}/tipo-productos`)
            .then(response => response.json())
            .then(data => setTipos(data))
            .catch(error => console.error('Error fetching data:', error))
            .finally(() => setLoading(false));
    }, []);

    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Tipos de Producto', url: '/admin/tipos' },
        { name: 'Config. Masiva', url: '/admin/config-masiva' },
        { name: 'Listas de Precio', url: '/admin/listas-de-precio' }
    ];

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <AdminNavbar links={miniNavbarLinks} />
            <div className={`container ${styles.container}`}>
                <h1 className={styles.header}>Tipos de Producto</h1>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <table className={`table ${styles.table}`}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Creado</th>
                                    <th>Actualizado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tipos.map(tipo => (
                                    <tr key={tipo.id}>
                                        <td>{tipo.id}</td>
                                        <td>{tipo.producto}</td>
                                        <td>{formatDate(tipo.created_at)}</td>
                                        <td>{formatDate(tipo.updated_at)}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm me-2" disabled={tipo.id === 1}>Editar</button>
                                            <button className="btn btn-danger btn-sm" disabled={tipo.id === 1}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default ListarTipos;
