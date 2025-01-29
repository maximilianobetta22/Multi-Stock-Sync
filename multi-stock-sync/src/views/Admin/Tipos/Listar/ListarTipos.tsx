import React, { useEffect, useState } from 'react';
import styles from './ListarTipos.module.css';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

const ListarTipos: React.FC = () => {
  interface Tipo {
    id: number;
    producto: string;
    created_at: string;
    updated_at: string;
  }

  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<Tipo | null>(null);

  useEffect(() => {
    fetch(`${process.env.VITE_API_URL}/tipo-productos`)
      .then(response => response.json())
      .then(data => setTipos(data))
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsFiltering(e.target.value !== '');
  };

  const filteredTipos = isFiltering
    ? tipos.filter(tipo =>
      tipo.producto?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : tipos;

  const handleDelete = (tipo: Tipo) => {
    setSelectedTipo(tipo);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedTipo) {
      setLoading(true);
      fetch(`${process.env.VITE_API_URL}/tipo-productos/${selectedTipo.id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.ok) {
            setTipos(tipos.filter(tipo => tipo.id !== selectedTipo.id));
          } else {
            console.error('Failed to delete the product type');
          }
        })
        .catch(error => console.error('Error deleting data:', error))
        .finally(() => {
          setShowModal(false);
          setSelectedTipo(null);
          setLoading(false);
        });
    }
  };

  return (
    <>
      <div className={`container ${styles.container}`}>
        <h1 className={styles.header}>Tipos de Producto</h1>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={`form-control ${styles.searchInput}`}
            placeholder="Buscar tipos de producto..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Link to="/admin/tipos/crear">
            <button className={`btn btn-multistock ${styles.createButton}`} type="button">
              Crear Tipo de Producto
            </button>
          </Link>
        </div>
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
                {filteredTipos.map(tipo => (
                  <tr key={tipo.id}>
                    <td>{tipo.id}</td>
                    <td>{tipo.producto}</td>
                    <td>{formatDate(tipo.created_at)}</td>
                    <td>{formatDate(tipo.updated_at)}</td>
                    <td>
                      <Link to={`/admin/tipos/editar/${tipo.id}`}>
                        <button className="btn btn-secondary btn-sm me-2" disabled={tipo.id === 1}>Editar</button>
                      </Link>
                      <button className="btn btn-danger btn-sm" disabled={tipo.id === 1} onClick={() => handleDelete(tipo)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && selectedTipo && (
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="Confirmar Eliminación"
        >
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro de que deseas eliminar este tipo de producto?</p>
          <button onClick={confirmDelete}>Eliminar</button>
          <button onClick={() => setShowModal(false)}>Cancelar</button>
        </Modal>
      )}
    </>
  );
};

export default ListarTipos;
