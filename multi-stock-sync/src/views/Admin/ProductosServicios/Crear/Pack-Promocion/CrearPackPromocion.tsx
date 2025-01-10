import React, { useState } from 'react';
import './CrearPackPromocion.css';
import { Link } from 'react-router-dom';

const CrearPackPromocion: React.FC = () => {

  interface Detail {
    id: number;
    product: string;
    quantity: number;
  }

  const [details, setDetails] = useState<Detail[]>([]);
  // Product full list

  const [products] = useState(['Producto 1', 'Producto 2', 'Producto 3', 'Producto 4', 'Producto 5']);

  
  const [filteredProducts, setFilteredProducts] = useState<string[]>(products);

  const [newDetail, setNewDetail] = useState<{ associateBy: string; variant: string; quantity: number }>({ associateBy: '', variant: '', quantity: 0 });

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const addDetail = () => {
    if (!newDetail.variant || newDetail.quantity <= 0) {
      return;
    }

    if (editIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editIndex] = { id: details[editIndex].id, product: newDetail.variant, quantity: newDetail.quantity };
      setDetails(updatedDetails);
      setEditIndex(null);
    } else {
      setDetails([
        ...details,
        { id: details.length + 1, product: newDetail.variant, quantity: newDetail.quantity },
      ]);
    }

    setNewDetail({ associateBy: '', variant: '', quantity: 0 });
    setShowModal(false);
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setNewDetail({ associateBy: '', variant: details[index].product, quantity: details[index].quantity });
    setShowModal(true);
  };

  const handleIncrement = (index: number) => {
    const updatedDetails = [...details];
    updatedDetails[index].quantity += 1;
    setDetails(updatedDetails);
  };

  const handleDecrement = (index: number) => {
    const updatedDetails = [...details];
    if (updatedDetails[index].quantity > 1) {
      updatedDetails[index].quantity -= 1;
    } else {
      updatedDetails.splice(index, 1);
    }
    setDetails(updatedDetails);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewDetail({ ...newDetail, [id]: value });

    // Filter products if searching in the variant field
    if (id === 'variant') {
      const filtered = products.filter((product) =>
        product.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleDropdownClick = (product: string) => {
    setNewDetail({ ...newDetail, variant: product });
    setFilteredProducts([]); // Close the dropdown by clearing the filtered products
  };

  return (
    <>
      <div className="d-flex flex-grow-1 main-container">

        <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <h1>Nuevo Pack/Promoción</h1>
            <form>
              <div className="form-group mb-3">
                <label htmlFor="packName" className="form-label">
                  Nombre del pack/promoción*
                </label>
                <input
                  type="text"
                  id="packName"
                  className="form-control"
                  placeholder="Ejemplo: Polera + Pantalón"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="packType" className="form-label">
                  Tipo*
                </label>
                <select id="packType" className="form-select">
                  <option value="">Seleccionar tipo</option>
                  <option value="pack">Pack</option>
                  <option value="promocion">Promoción</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="brand" className="form-label">Marca</label>
                <input
                  type="text"
                  id="brand"
                  className="form-control"
                  placeholder="Nombre de la marca"
                />
              </div>

              <Link to="/admin/productos-servicios" className="btn btn-secondary me-2">
                Cancelar
              </Link>

              <button type="submit" className="btn btn-primary">
                Guardar
              </button>

            </form>
          </div>
        </div>

        <div className="w-50 custom-gray p-3 d-flex flex-column">

          <div className="v-50 p-3 d-flex align-items-center justify-content-center">
            <div>
              <h1>Atributos Generales</h1>
              <form>
                <div className="form-group mb-3">
                  <label htmlFor="sku" className="form-label">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    className="form-control"
                    placeholder="Si no tienes, te crearemos uno"
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="barcode" className="form-label">Código de barras</label>
                  <input
                    type="text"
                    id="barcode"
                    className="form-control"
                    placeholder="Si no tienes, te crearemos uno"
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="price" className="form-label">Precio (con impuestos)</label>
                  <input
                    type="number"
                    id="price"
                    className="form-control"
                    placeholder="Podrás editarlo luego en Lista de Precios"
                  />
                </div>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="printDetails"
                  />
                  <label className="form-check-label" htmlFor="printDetails">
                    ¿Imprimir el detalle del pack/promoción en documentos?
                  </label>
                </div>
              </form>
            </div>
          </div>


          <div className="v-50 p-3 d-flex flex-column">
            <h1>Detalles del Pack/Promoción</h1>
            <div className="details-table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail, index) => (
                  <tr key={detail.id}>
                    <td>{detail.id}</td>
                    <td>{detail.product}</td>
                    <td>{detail.quantity}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(index)}>Editar</button>
                      <button className="btn btn-sm btn-secondary me-2" onClick={() => handleIncrement(index)}>+1</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleDecrement(index)}>-1</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => setShowModal(true)}
            >
              Agregar Detalle
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editIndex !== null ? 'Editar' : 'Agregar'} Detalle de Pack/Promoción</h2>
            <form>
              <div className="form-group mb-3">
                <label htmlFor="associateBy" className="form-label">Asociar por*</label>
                <select
                  id="associateBy"
                  className="form-select"
                  value={newDetail.associateBy}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="Producto">Producto</option>
                  <option value="Servicio">Servicio</option>
                </select>
              </div>
              <div className="form-group mb-3 position-relative">
                <label htmlFor="variant" className="form-label">Variante*</label>
                <input
                  type="text"
                  id="variant"
                  className="form-control"
                  placeholder="Buscar producto"
                  value={newDetail.variant}
                  onChange={handleInputChange}
                />
                {newDetail.variant && filteredProducts.length > 0 && (
                  <ul className="servicio_dropdown">
                    {filteredProducts.map((product, index) => (
                      <li
                        key={index}
                        onClick={() => handleDropdownClick(product)}
                      >
                        {product}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group mb-3">
                <label htmlFor="quantity" className="form-label">Cantidad*</label>
                <input
                  type="number"
                  id="quantity"
                  className="form-control"
                  placeholder="Cantidad"
                  value={newDetail.quantity}
                  onChange={(e) =>
                    setNewDetail({ ...newDetail, quantity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </form>
            <button
              className="btn btn-secondary me-2"
              onClick={() => {
                setShowModal(false);
                setEditIndex(null);
              }}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={addDetail}>
              {editIndex !== null ? 'Guardar Cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CrearPackPromocion;
