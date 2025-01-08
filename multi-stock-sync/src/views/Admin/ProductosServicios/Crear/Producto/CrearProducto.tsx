import React, { useState, useEffect } from "react";
import AdminNavbar from "../../../../../components/AdminNavbar/AdminNavbar";
import { Link } from "react-router-dom";
import styles from "./CrearProducto.module.css";

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

  const [brands, setBrands] = useState<{ id: number; nombre: string }[]>([]);
  const [productTypes, setProductTypes] = useState<{ id: number; producto: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandsAndProductTypes = async () => {
      try {
        const [brandsResponse, productTypesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/marcas`),
          fetch(`${import.meta.env.VITE_API_URL}/tipo-productos`)
        ]);

        const brandsData = await brandsResponse.json();
        const productTypesData = await productTypesResponse.json();

        setBrands(brandsData);
        setProductTypes(productTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandsAndProductTypes();
  }, []);

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

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <>
      <AdminNavbar links={miniNavbarLinks} />
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-50 p-4 d-flex align-items-start justify-content-center">
          <div className={styles.formContainer}>
            <h2 className={styles.mb4}>Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="productName" className={styles.formLabel}>
                  Nombre del producto*
                </label>
                <input
                  type="text"
                  id="productName"
                  className={`${styles.formControl} ${formErrors.productName ? styles.isInvalid : ""}`}
                  placeholder="Nombre general (Ejemplo: Polera)"
                  value={formValues.productName}
                  onChange={handleInputChange}
                />
                {formErrors.productName && (
                  <small className={styles.textDanger}>Este campo es obligatorio.</small>
                )}
              </div>

              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="productType" className={styles.formLabel}>
                  Tipo*
                </label>
                <select
                  id="productType"
                  className={`${styles.formSelect} ${formErrors.productType ? styles.isInvalid : ""}`}
                  value={formValues.productType}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar tipo</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.producto}</option>
                  ))}
                </select>
                {formErrors.productType && (
                  <small className={styles.textDanger}>Este campo es obligatorio.</small>
                )}
              </div>

              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="brand" className={styles.formLabel}>
                  Marca
                </label>
                <select
                  id="brand"
                  className={styles.formSelect}
                  value={formValues.brand}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.nombre}</option>
                  ))}
                </select>
              </div>

              <Link to="/admin/productos-servicios" className={`btn btn-secondary ${styles.btnSecondary}`}>
                Cancelar
              </Link>

              <button type="submit" className={`btn btn-primary ${styles.btnPrimary}`}>
                Guardar
              </button>
            </form>
          </div>
        </div>

        <div className={`w-50 custom-gray p-3 d-flex align-items-center justify-content-center`}>
          <div className={styles.formContainer}>
            <h2 className={styles.mb4}>Atributos Generales</h2>
            <form>
              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="variantName" className={styles.formLabel}>
                  Nombre de variante
                </label>
                <input
                  type="text"
                  id="variantName"
                  className={styles.formControl}
                  placeholder="Lo que marca la diferencia (Ejemplo: Talla L)"
                />
              </div>

              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="sku" className={styles.formLabel}>
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  className={styles.formControl}
                  placeholder="Si no tienes, te crearemos uno"
                />
              </div>

              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="barcode" className={styles.formLabel}>
                  Código de barras
                </label>
                <input
                  type="text"
                  id="barcode"
                  className={styles.formControl}
                  placeholder="Si no tienes, te crearemos uno"
                />
              </div>

              <div className={`${styles.formGroup} mb-3`}>
                <label htmlFor="price" className={styles.formLabel}>
                  Precio (con impuestos)
                </label>
                <input
                  type="number"
                  id="price"
                  className={styles.formControl}
                  placeholder="Podrás editarlo luego en Lista de Precios"
                />
              </div>

              <div className={`${styles.formCheckInput} form-check form-switch mb-3`}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="controlStock"
                  defaultChecked
                />
                <label className={styles.formCheckLabel} htmlFor="controlStock">
                  Controlar stock
                </label>
              </div>

              <div className={`${styles.formCheckInput} form-check form-switch mb-3`}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allowSalesWithoutStock"
                />
                <label className={styles.formCheckLabel} htmlFor="allowSalesWithoutStock">
                  Permitir venta sin stock
                </label>
              </div>

              <div className={`${styles.formCheckInput} form-check form-switch mb-3`}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="controlSeries"
                />
                <label className={styles.formCheckLabel} htmlFor="controlSeries">
                  Controlar series
                </label>
              </div>

              <div className={`${styles.formCheckInput} form-check form-switch`}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allowDecimalSales"
                />
                <label className={styles.formCheckLabel} htmlFor="allowDecimalSales">
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
