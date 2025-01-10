import React, { useState } from 'react';
import styles from './CrearMarca.module.css';

const CrearMarca: React.FC = () => {

  const [showForm, setShowForm] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editId, setEditId] = useState<number | null>(null); 
  const [newMarca, setNewMarca] = useState({ name: '', image: '' }); 
  const [marcas, setMarcas] = useState([
    { id: 1, name: 'Sin marca', image: '' },
    
  ]); 
  const [searchQuery, setSearchQuery] = useState(''); 

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  
  const filteredMarcas = marcas.filter((marca) =>
    marca.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMarca({ ...newMarca, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMarca({ ...newMarca, image: URL.createObjectURL(file) });
    }
  };

  const handleAddMarca = () => {
    if (newMarca.name.trim()) {
      if (isEditing && editId !== null) {
        
        setMarcas(
          marcas.map((marca) =>
            marca.id === editId ? { ...marca, ...newMarca } : marca
          )
        );
      } else {
        
        setMarcas([...marcas, { id: marcas.length + 1, ...newMarca }]);
      }
      
      setNewMarca({ name: '', image: '' });
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    }
  };

  const handleEdit = (id: number) => {
    const marcaToEdit = marcas.find((marca) => marca.id === id);
    if (marcaToEdit) {
      setNewMarca({ name: marcaToEdit.name, image: marcaToEdit.image });
      setShowForm(true);
      setIsEditing(true);
      setEditId(id);
    }
  };

  const handleDelete = (id: number) => {
    setMarcas(marcas.filter((marca) => marca.id !== id));
  };

  return (
    <>
      <div className="main-container">
        {}
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

        {}
        {showForm && (
          <div className={styles['form-container']}>
            <h2>{isEditing ? 'Editar Marca de Producto' : 'Nueva Marca de Producto'}</h2>
            <div className={styles["form-group"]}>
              <label>Título de la Marca</label>
              <input
                type="text"
                name="name"
                value={newMarca.name}
                onChange={handleChange}
                placeholder="Nombre"
                maxLength={45}
              />
              <small>{newMarca.name.length} / 45</small>
            </div>
            <div className={styles['form-group']}>
              <label>Nueva Imagen</label>
              <input
                type="file"
                name="image"
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

        {}
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
                <td>{marca.name}</td>
                <td>
                  {marca.image ? (
                    <img src={marca.image} alt={marca.name} className={styles['table-img']} />
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
  );
};

export default CrearMarca;
