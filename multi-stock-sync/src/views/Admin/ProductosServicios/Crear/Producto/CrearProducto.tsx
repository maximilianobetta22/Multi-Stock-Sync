import React, { useState } from "react";
import AdminNavbar from "../../../../../components/AdminNavbar/AdminNavbar";
import { Link } from "react-router-dom";
import "./CrearProducto.css";

const CrearProducto: React.FC = () => {
    const miniNavbarLinks = [
        { name: 'Mis Productos y Servicios', url: '/admin/productos-servicios' },
        { name: 'Marcas', url: '/admin/marcas' },
        { name: 'Config. Masiva', url: '/admin/config-masiva' },
        { name: 'Listas de Precio', url: '/admin/listas-de-precio' }
    ];

  const [formValues, setFormValues] = useState({
    productName: "",
    productType: "",
    brand: "",
  });

  const [formErrors, setFormErrors] = useState({
    productName: false,
    productType: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
    setFormErrors({ ...formErrors, [id]: false }); // Clear the error if the field is modified
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate obligatory fields
    const errors = {
      productName: formValues.productName.trim() === "",
      productType: formValues.productType.trim() === "",
    };

    setFormErrors(errors);

    // If not errors, submit the form
    const hasErrors = Object.values(errors).some((error) => error);
    if (!hasErrors) {
      console.log("Formulario enviado:", formValues);
      // Form handling here
    }
  };

  return (
    <>
      <AdminNavbar links={miniNavbarLinks} />
      <div className="d-flex flex-grow-1 main-container">

        <div className="w-50 p-4 d-flex align-items-start justify-content-center">
          <div className="form-container">
            <h2 className="mb-4">Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="productName" className="form-label">
                  Nombre del producto*
                </label>
                <input
                  type="text"
                  id="productName"
                  className={`form-control ${formErrors.productName ? "is-invalid" : ""}`}
                  placeholder="Nombre general (Ejemplo: Polera)"
                  value={formValues.productName}
                  onChange={handleInputChange}
                />
                {formErrors.productName && (
                  <small className="text-danger">Este campo es obligatorio.</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="productType" className="form-label">
                  Tipo*
                </label>
                <select
                  id="productType"
                  className={`form-select ${formErrors.productType ? "is-invalid" : ""}`}
                  value={formValues.productType}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="tipo1">Tipo 1</option>
                  <option value="tipo2">Tipo 2</option>
                </select>
                {formErrors.productType && (
                  <small className="text-danger">Este campo es obligatorio.</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="brand" className="form-label">
                  Marca
                </label>
                <input
                  type="text"
                  id="brand"
                  className="form-control"
                  placeholder="Nombre de la marca"
                  value={formValues.brand}
                  onChange={handleInputChange}
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

        <div className="w-50 p-4 bg-light d-flex align-items-start justify-content-center">
          <div className="form-container">
            <h2 className="mb-4">Atributos Generales</h2>
            <form>
              <div className="form-group mb-3">
                <label htmlFor="variantName" className="form-label">
                  Nombre de variante
                </label>
                <input
                  type="text"
                  id="variantName"
                  className="form-control"
                  placeholder="Lo que marca la diferencia (Ejemplo: Talla L)"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="sku" className="form-label">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  className="form-control"
                  placeholder="Si no tienes, te crearemos uno"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="barcode" className="form-label">
                  Código de barras
                </label>
                <input
                  type="text"
                  id="barcode"
                  className="form-control"
                  placeholder="Si no tienes, te crearemos uno"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="price" className="form-label">
                  Precio (con impuestos)
                </label>
                <input
                  type="number"
                  id="price"
                  className="form-control"
                  placeholder="Podrás editarlo luego en Lista de Precios"
                />
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="controlStock"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="controlStock">
                  Controlar stock
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allowSalesWithoutStock"
                />
                <label className="form-check-label" htmlFor="allowSalesWithoutStock">
                  Permitir venta sin stock
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="controlSeries"
                />
                <label className="form-check-label" htmlFor="controlSeries">
                  Controlar series
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allowDecimalSales"
                />
                <label className="form-check-label" htmlFor="allowDecimalSales">
                  Permitir venta con decimales
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CrearProducto;
