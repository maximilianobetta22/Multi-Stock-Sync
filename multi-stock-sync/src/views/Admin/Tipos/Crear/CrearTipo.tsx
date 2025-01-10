import React, { useState } from 'react';
import styles from './CrearTipo.module.css';
import { Link } from 'react-router-dom';

const CrearTipo: React.FC = () => {
  const [producto, setProducto] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ producto?: string[] }>({});
  const [productId, setProductId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

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
      const response = await fetch(`${process.env.VITE_API_URL}/tipo-productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ producto }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Tipo de producto creado exitosamente');
        setProducto('');
        setProductId(data.data.id);
        setCreatedAt(data.data.created_at);
      } else {
        setErrors(data.errors);
      }
    } catch (error) {
      console.error('Error creating product type:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-100 bg-light p-3 d-flex align-items-center justify-content-center">
          <div className={styles.formContainer}>
            <h1>Crear Tipo de Producto</h1>
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
                  'Crear'
                )}
              </button>

              <Link to="/admin/tipos" className="btn btn-secondary ms-2">
                Salir
              </Link>

            </form>
            {message && (
              <div className="alert alert-success mt-3">
                {message}
                {productId && <div>ID: {productId}</div>}
                {createdAt && <div>Fecha de creación: {formatDate(createdAt)}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CrearTipo;
