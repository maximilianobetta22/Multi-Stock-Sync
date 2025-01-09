import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './EditarTipo.module.css';
import AdminNavbar from '../../../../components/AdminNavbar/AdminNavbar';
import { Link } from 'react-router-dom';

const EditarTipo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [producto, setProducto] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ producto?: string[] }>({});
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Tipos de Producto', url: '/admin/tipos' },
        { name: 'Config. Masiva', url: '/admin/config-masiva' },
        { name: 'Listas de Precio', url: '/admin/listas-de-precio' }
    ];

    useEffect(() => {
        const fetchTipo = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.VITE_API_URL}/tipo-productos/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setProducto(data.producto);
                    setCreatedAt(data.created_at);
                    setUpdatedAt(data.updated_at);
                } else {
                    console.error('Failed to fetch product type');
                }
            } catch (error) {
                console.error('Error fetching product type:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTipo();
    }, [id]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            const response = await fetch(`${process.env.VITE_API_URL}/tipo-productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ producto }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Tipo de producto actualizado exitosamente');
                setUpdatedAt(data.data.updated_at);
            } else {
                setErrors(data.errors);
            }
        } catch (error) {
            console.error('Error updating product type:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AdminNavbar links={miniNavbarLinks} />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div className={styles.formContainer}>
                        <h1>Editar tipo de Producto</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="producto" className="form-label">Nombre del Producto</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.producto ? 'is-invalid' : ''}`}
                                    id="producto"
                                    value={producto}
                                    onChange={(e) => setProducto(e.target.value)}
                                />
                                {errors.producto && (
                                    <div className="invalid-feedback">
                                        {errors.producto.join(', ')}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-multistock" disabled={loading}>
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    'Editar'
                                )}
                            </button>

                            <Link to="/admin/tipos" className="btn btn-secondary ms-2">
                                Salir
                            </Link>
                        </form>
                        {message && (
                            <div className="alert alert-success mt-3">
                                {message}
                                {createdAt && <div>Fecha de creación: {formatDate(createdAt)}</div>}
                                {updatedAt && <div>Fecha de modificación: {formatDate(updatedAt)}</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditarTipo;
