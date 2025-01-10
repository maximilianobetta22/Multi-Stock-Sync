import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CrearServicio.css";

const CrearServicio: React.FC = () => {

  const [formValues, setFormValues] = useState({
    serviceName: "",
    serviceType: "",
    brand: "",
    netCost: 0,
  });

  const [formErrors, setFormErrors] = useState({
    serviceName: false,
    serviceType: false,
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
      serviceName: formValues.serviceName.trim() === "",
      serviceType: formValues.serviceType.trim() === "",
    };

    setFormErrors(errors);

    // If no errors, submit the form
    const hasErrors = Object.values(errors).some((error) => error);
    if (!hasErrors) {
      console.log("Formulario enviado:", formValues);
      // Form handling here
    }
  };

  return (
    <>
      <div className="d-flex flex-grow-1 main-container">
        {/* Columna izquierda */}
        <div className="w-50 p-4 d-flex align-items-start justify-content-center">
          <div className="form-container">
            <h2 className="mb-4">Nuevo Servicio</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="serviceName" className="form-label">
                  Nombre del servicio*
                </label>
                <input
                  type="text"
                  id="serviceName"
                  className={`form-control ${formErrors.serviceName ? "is-invalid" : ""}`}
                  placeholder="Nombre general (Ejemplo: Bsale)"
                  value={formValues.serviceName}
                  onChange={handleInputChange}
                />
                {formErrors.serviceName && (
                  <small className="text-danger">Este campo es obligatorio.</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="serviceType" className="form-label">
                  Tipo*
                </label>
                <select
                  id="serviceType"
                  className={`form-select ${formErrors.serviceType ? "is-invalid" : ""}`}
                  value={formValues.serviceType}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="consultoria">Consultoría</option>
                  <option value="soporte">Soporte</option>
                </select>
                {formErrors.serviceType && (
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

        {/* Columna derecha */}
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
                  placeholder="Lo que marca la diferencia (Ejemplo: Standard)"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="netCost" className="form-label">
                  Costo Neto Unitario
                </label>
                <input
                  type="number"
                  id="netCost"
                  className="form-control"
                  value={formValues.netCost}
                  onChange={handleInputChange}
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

export default CrearServicio;
