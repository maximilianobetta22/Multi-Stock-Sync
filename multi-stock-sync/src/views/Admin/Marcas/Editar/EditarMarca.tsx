import React, { useState } from 'react';
import './EditarMarca.css';

const EditarMarca: React.FC = () => {
  // Estado para el filtro de búsqueda
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const filteredContent = query
    ? 'Resultado filtrado para: ' + query
    : 'Aquí va el contenido principal del lado izquierdo.';

  return (
    <>
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <h1>Contenido Izquierdo</h1>
            <div className="search-filter">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Buscar..."
                className="search-input"
              />
            </div>
            <p>{filteredContent}</p>
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

export default EditarMarca;