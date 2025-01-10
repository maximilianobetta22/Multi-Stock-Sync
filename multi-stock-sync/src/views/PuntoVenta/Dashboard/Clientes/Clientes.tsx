import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCheckCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import './Clientes.css';
import ClientesModal from './Modal/ClientesModal';

const Clientes: React.FC<{ searchQuery: string, setSearchQuery: React.Dispatch<React.SetStateAction<string>>, onSelectClient: (client: any) => void }> = ({ searchQuery, setSearchQuery, onSelectClient }) => {
  const [isNewClient, setIsNewClient] = useState(false); // Change to search or form
  const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null); // New state for selected client
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]); // State for clients fetched from API
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clientes`)
      .then(response => response.json())
      .then(data => {
        setClientes(data.data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clientes.filter((cliente) =>
        cliente.nombres.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes([]);
    }
  }, [searchQuery, clientes]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filtered = clientes.filter((cliente) =>
        cliente.nombres.toLowerCase().includes(query)
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes([]);
    }
  };

  const handleEditClick = (cliente: any) => {
    setSelectedClient(cliente);
    setIsNewClient(true);
  };

  const handleNewClientClick = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectClient = (client: any) => {
    onSelectClient(client);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newClient = {
      tipo_cliente_id: formData.get('tipo_cliente_id'),
      extranjero: formData.get('extranjero') === 'sí' ? 1 : 0,
      rut: formData.get('rut'),
      razon_social: formData.get('razon_social'),
      giro: formData.get('giro'),
      nombres: formData.get('nombres'),
      apellidos: formData.get('apellidos'),
      direccion: formData.get('direccion'),
      comuna: formData.get('comuna'),
      ciudad: formData.get('ciudad'),
      region: formData.get('region')
    };
    // Assuming the API supports POST request to create a new client
    fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClient)
    })
      .then(response => response.json())
      .then(data => {
        setClientes([...clientes, data]);
        setIsNewClient(false);
        onSelectClient(data);
      })
      .catch(error => console.error('Error creating client:', error));
  };

  return (
    <div className={` ${isNewClient ? 'nuevo-cliente-form' : ''}`}>
      {isNewClient ? (
        // Nuevo cliente form
        <div className="nuevo-cliente-form">
          <h2 className="clientes-header">
            <FontAwesomeIcon icon={faUser} className="header-icon" /> {selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <form className="formulario" onSubmit={handleFormSubmit}>
            <label>
              Tipo de Cliente
              <select name="tipo_cliente_id">
                <option value="1">empresa</option>
                <option value="2">persona</option>
              </select>
            </label>
            <label>
              Cliente Extranjero
              <select name="extranjero">
                <option value="0">no</option>
                <option value="1">sí</option>
              </select>
            </label>
            <label>Rut<input type="text" name="rut" /></label>
            <label>Razón Social<input type="text" name="razon_social" /></label>
            <label>Giro<input type="text" name="giro" /></label>
            <label>Nombres<input type="text" name="nombres" /></label>
            <label>Apellidos<input type="text" name="apellidos" /></label>
            <label>Dirección<input type="text" name="direccion" /></label>
            <label>Comuna<input type="text" name="comuna" /></label>
            <label>Ciudad<input type="text" name="ciudad" /></label>
            <label>Región<input type="text" name="region" /></label>
            <div className="form-buttons">
              <button
                type="button"
                className="cancelar-button"
                onClick={() => setIsNewClient(false)}
              >
                cancelar
              </button>
              <button type="submit" className="guardar-button">
                GUARDAR <FontAwesomeIcon icon={faCheckCircle} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Cliente finder
        <>
          <h2 className="destacados-header">
            <FontAwesomeIcon icon={faUser} className="header-icon" /> Clientes
          </h2>
          <div className="search-bar"><input type="text" placeholder="Buscar cliente" className="bar-search-input" value={searchQuery} onChange={handleSearch} /></div>
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <div className="clientes-table-container">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {searchQuery && filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.nombres} {cliente.apellidos}</td>
                        <td>
                          <FontAwesomeIcon icon={faEdit} className="cliente-icon" onClick={() => handleEditClick(cliente)} />
                          <FontAwesomeIcon icon={faCheckCircle} className="cliente-icon" onClick={() => handleSelectClient(cliente)} />
                        </td>
                      </tr>
                    ))
                  ) : searchQuery ? (
                    <tr>
                      <td colSpan={2} className="no-results">Cliente no encontrado.</td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.nombres} {cliente.apellidos}</td>
                        <td>
                          <FontAwesomeIcon icon={faEdit} className="cliente-icon" onClick={() => handleEditClick(cliente)} />
                          <FontAwesomeIcon icon={faCheckCircle} className="cliente-icon" onClick={() => handleSelectClient(cliente)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <button
            className="nuevo-cliente-button"
            onClick={handleNewClientClick}
          >
            NUEVO <FontAwesomeIcon icon={faCheckCircle} />
          </button>
        </>
      )}
      <ClientesModal show={showModal} handleClose={handleCloseModal} selectedClient={selectedClient} />
    </div>
  );
};

export default Clientes;
