import React, { useState, useEffect } from 'react';
import styles from './CrearMarca.module.css';

interface Marca {
  id: number;
  nombre: string;
  imagen: string;
}

const CrearMarca: React.FC = () => {

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newMarca, setNewMarca] = useState({ nombre: '', imagen: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarcas = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/marcas`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMarcas(data.map((item) => ({
            id: item.id,
            nombre: item.nombre || '',
            imagen: item.imagen || ''
          })));
        } else {
          setError('Error al cargar las marcas');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar las marcas');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredMarcas = marcas.filter((marca) =>
    marca.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMarca({ ...newMarca, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMarca({ ...newMarca, imagen: URL.createObjectURL(file) });
    }
  };

  const handleAddMarca = () => {
    if (newMarca.nombre.trim()) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/marcas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMarca),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errors) {
            setError(data.errors.nombre[0]);
          } else {
            fetchMarcas();
            setNewMarca({ nombre: '', imagen: '' });
            setShowForm(false);
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Error al agregar la marca');
          setLoading(false);
        });
    }
  };

  const handleEdit = (id: number) => {
    const marcaToEdit = marcas.find((marca) => marca.id === id);
    if (marcaToEdit) {
      setNewMarca({ nombre: marcaToEdit.nombre, imagen: marcaToEdit.imagen });
      setShowForm(true);
      setIsEditing(true);
    }
  };

  const handleDelete = (id: number) => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/marcas/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        fetchMarcas();
        setLoading(false);
      })
      .catch(() => {
        setError('Error al eliminar la marca');
        setLoading(false);
      });
  };

  return (
    <>
      <div className="main-container">
        {loading && <div className={styles.spinner}></div>}
        {error && <div className={styles['error-message']}>{error}</div>}
        {!loading && !error && (
          <>
            <div className={styles.header}>
              <div className={styles['search-filter']}>
                <input
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchQuery}
                  onChange={handleSearch}
                  className={styles['search-input']}
                />
              </div>
              <button className={styles['btn-add']} onClick={() => setShowForm(!showForm)}>
                {isEditing ? 'EDITAR MARCA' : 'CREAR MARCA'}
              </button>
            </div>

            {showForm && (
              <div className={styles['form-container']}>
                <h2>{isEditing ? 'Editar Marca de Producto' : 'Nueva Marca de Producto'}</h2>
                <div className={styles['form-group']}>
                  <label>Título de la Marca</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newMarca.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    maxLength={45}
                  />
                  <small>{newMarca.nombre.length} / 45</small>
                </div>
                <div className={styles['form-group']}>
                  <label>Nueva Imagen</label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className={styles['form-actions']}>
                  <button className={styles['btn-cancel']} onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                  <button className={styles['btn-save']} onClick={handleAddMarca}>
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}

            <div className={styles['table-container']} style={{ height: '100%' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre de la Marca</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarcas.map((marca) => (
                    <tr key={marca.id}>
                      <td>{marca.nombre}</td>
                      <td>
                        {marca.imagen ? (
                          <img src={marca.imagen} alt={marca.nombre} className={styles['table-img']} />
                        ) : (
                          <div className={styles['table-placeholder']}>Sin imagen</div>
                        )}
                      </td>
                      <td>
                        <button className={styles['btn-edit']} onClick={() => handleEdit(marca.id)}>
                          ✏️
                        </button>
                        <button className={styles['btn-delete']} onClick={() => handleDelete(marca.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CrearMarca;
