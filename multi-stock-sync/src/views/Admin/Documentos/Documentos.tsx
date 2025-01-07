import React, { useState } from 'react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import './Documentos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import ClientesList from './Clientes/ClientesList';
import ProductosServiciosList from './Productos/ProductosServiciosList';

interface Producto {
  name: string;
  price: number;
  quantity: number;
}

const GlosaModal: React.FC<{ onClose: () => void, onSave: (glosa: Producto) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);

  const handleSave = () => {
    if (name.trim() === '' || description.trim() === '') {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }
    onSave({ name, price, quantity: 1 });
    onClose();
  };

  const formatCLP = (amount: number) => {
    return `$${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-4">
        <h2 className="mb-4">Nueva Glosa</h2>
        <div className="mb-3">
          <label htmlFor="glosa-name" className="form-label">Nombre</label>
          <input
            type="text"
            id="glosa-name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="glosa-description" className="form-label">Descripción</label>
          <textarea
            id="glosa-description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="glosa-price" className="form-label">Precio</label>
          <input
            type="text"
            id="glosa-price"
            className="form-control"
            value={formatCLP(price)}
            onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')))}
            required
          />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary me-2" onClick={handleSave}>Guardar</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const Documentos: React.FC = () => {
  const miniNavbarLinks = [
    { name: 'Buscar/Enviar', url: '#' },
    { name: 'Crédito', url: '#' }
  ];
  const miniNavbarDropdowns = [
    {
      name: 'Nuevo',
      options: [
        { name: 'En blanco', url: '#' },
        { name: 'A partir de existente', url: '#' },
        { name: 'Importando detalle', url: '#' },
        { name: 'Importando documentos', url: '#' }
      ]
    },
    {
      name: 'Devoluciones',
      options: [
        { name: 'Producto/Servicio', url: '#' },
        { name: 'Ajuste de Precio (Nota Crédito, no modifica stock)', url: '#' },
        { name: 'Ajuste de Precio (Nota Débito, no modifica stock)', url: '#' },
        { name: 'Ajuste de Texto', url: '#' },
        { name: 'Anular Devolución', url: '#' },
        { name: 'Anular Nota Débito, no modifica stock', url: '#' }
      ]
    },
    {
      name: 'Más opciones',
      options: [
        { name: 'Calendario', url: '#' },
        { name: 'Hito para Nuevo Documento', url: '#' },
        { name: 'Retiro de Abono', url: '#' },
        { name: 'Cierre de Mes', url: '#' },
        { name: 'Cesion', url: '#' },
        { name: 'Libros', url: '#' },
        { name: 'Importar Docs. Libros', url: '#' },
        { name: 'Editar Documento', url: '#' }

      ]
    }
  ];

  const [searchQueryClientes, setSearchQueryClientes] = useState('');
  const [searchQueryProductos, setSearchQueryProductos] = useState('');
  const [activeComponent, setActiveComponent] = useState('clientes');
  const [clientName, setClientName] = useState('');
  const [cart, setCart] = useState<Producto[]>([]);
  const [isGlosaModalOpen, setIsGlosaModalOpen] = useState(false);

  const handleSearchChangeClientes = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQueryClientes(event.target.value);
    setActiveComponent('clientes');
  };

  const handleSearchChangeProductos = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQueryProductos(event.target.value);
    setActiveComponent('productos');
  };

  interface Producto {
    name: string;
    price: number;
    quantity: number;
  }

  const handleAddProductToCart = (product: Producto) => {
    setCart((prevCart) => {
      // Make a copy of the cart to avoid mutations
      const updatedCart = [...prevCart];

      // Check if the product already exists
      const existingProductIndex = updatedCart.findIndex((item) => item.name === product.name);

      if (existingProductIndex !== -1) {
        // If the product exists, update only the quantity
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + 1,
        };
      } else {
        // If it doesn't exist, add it with initial quantity 1
        updatedCart.push({ ...product, quantity: 1 });
      }

      return updatedCart; // Return the updated cart
    });
  };


  const handleRemoveProductFromCart = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart]; // Create a copy of the cart

      if (updatedCart[index].quantity > 1) {
        // If the quantity is greater than 1, just reduce it
        updatedCart[index] = {
          ...updatedCart[index],
          quantity: updatedCart[index].quantity - 1,
        };
      } else {
        // If the quantity is 1, remove the product
        updatedCart.splice(index, 1);
      }

      return updatedCart; // Return the updated cart
    });
  };


  const handleRemoveAllOfProduct = (productName: string) => {

    // Deletes all products of a list

    setCart((prevCart) => prevCart.filter((product) => product.name !== productName));
  };


  const handleAssignClient = (client: string) => {
    setClientName(client);
  };

  const handleRemoveClient = () => {
    setClientName('');
  };

  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const formatCLP = (amount: number) => {
    return `$${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const renderActiveComponent = () => {
    if (activeComponent === 'clientes') {
      return <ClientesList searchQuery={searchQueryClientes} handleSearchChange={handleSearchChangeClientes} handleAssignClient={handleAssignClient} />;
    } else if (activeComponent === 'productos') {
      return <ProductosServiciosList searchQuery={searchQueryProductos} handleSearchChange={handleSearchChangeProductos} handleAddProductToCart={handleAddProductToCart} />;
    }
  };

  const handleOpenGlosaModal = () => {
    setIsGlosaModalOpen(true);
  };

  const handleCloseGlosaModal = () => {
    setIsGlosaModalOpen(false);
    console.log("hola")
  };

  const handleSaveGlosa = (glosa: Producto) => {
    handleAddProductToCart(glosa);
  };

  return (
    <>
      {isGlosaModalOpen && <GlosaModal onClose={handleCloseGlosaModal} onSave={handleSaveGlosa} />}
      <AdminNavbar links={miniNavbarLinks} dropdowns={miniNavbarDropdowns} />
      <div className="d-flex flex-grow-1 main-container">

        <div className="w-60 bg-light p-3 documentos-main-container d-flex flex-column">
          <div className="documentos-search-container mb-4 d-flex justify-content-start align-items-center">
            <div className="d-flex w-100">
              <input
                type="text"
                placeholder="Buscar producto"
                aria-label="Buscar producto"
                className="documentos-search-input me-2"
                value={searchQueryProductos}
                onChange={handleSearchChangeProductos}
              />
              <button type="button" className="documentos-search-button">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
            <button className="btn documentos-glosa-button ms-3" onClick={handleOpenGlosaModal}>+ Nueva Glosa</button>
          </div>
          <div className="documentos-table-container flex-grow-1">
            <table>
              <thead>
                <tr>
                  <th>Cantidad</th>
                  <th>Detalle</th>
                  <th>$ / unidad</th>
                  <th>% desc.</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((product, index) => (
                  <tr key={index}>
                    <td><strong>{product.quantity}</strong></td>
                    <td>{product.name}</td>
                    <td>{formatCLP(product.price)}</td>
                    <td>0%</td>
                    <td>{formatCLP(product.price * product.quantity)}</td>
                    <td>
                      <button
                        className="invisible-button me-2"
                        onClick={() => handleAddProductToCart(product)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>

                      <button
                        className="invisible-button me-2"
                        onClick={() => handleRemoveProductFromCart(index)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>

                      <button
                        className="invisible-button"
                        onClick={() => handleRemoveAllOfProduct(product.name)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="documentos-footer-container mt-4 d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <span className="documentos-client-name">{clientName}
                {clientName && (<button className="btn btn-danger btn-sm mx-2 mb-1" onClick={handleRemoveClient}>Quitar Cliente</button>)}
              </span>
              <div className="documentos-client-search">
                <input
                  type="text"
                  placeholder="Buscar cliente"
                  aria-label="Buscar cliente"
                  className="documentos-client-search-input me-2"
                  value={searchQueryClientes}
                  onChange={handleSearchChangeClientes}
                />
                <button type="button" className="documentos-client-search-button">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
            <span>Nr. Líneas: {cart.length} / Tot. Ítems: {cart.reduce((total, product) => total + product.quantity, 0)}</span>
            <div className="d-flex align-items-center">
              <select className="form-select documentos-select me-3">
                <option>Boleta Manual</option>
                <option>Cotización</option>
                <option>Factura</option>
                <option>Nota Venta</option>
              </select>
              <span>Total: {formatCLP(calculateTotal())}</span>
            </div>
            <button className="btn btn-primary documentos-confirm-button">Confirmar</button>
          </div>
        </div>

        <div className="w-40 custom-gray p-3 d-flex flex-column justify-content-between">
          <div className="clientes-buttons-container d-flex justify-content-between">
            <button className={`btn btn-${activeComponent === 'clientes' ? 'primary' : 'secondary'} me-2`} onClick={() => setActiveComponent('clientes')}>Clientes</button>
            <button className={`btn btn-${activeComponent === 'productos' ? 'primary' : 'secondary'}`} onClick={() => setActiveComponent('productos')}>Productos</button>
          </div>
          <div className="clientes-list-container">
            {renderActiveComponent()}
          </div>
        </div>
      </div>

    </>
  );
};

export default Documentos;