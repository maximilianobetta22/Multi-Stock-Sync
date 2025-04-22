import styles from "./DetalleBodega.module.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Product } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";
import axiosInstance from "../../../../../axiosConfig";

const DetalleBodega = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchWarehouse, warehouse } = useWarehouseManagement();

  const placeholderImage = "/assets/img/icons/image_notfound.svg";

  // Función para obtener los productos de la bodega
  const fetchProducts = async (id: string) => {
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouse/${id}/stock`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (data?.ok && Array.isArray(data.data)) {
        setProducts(data.data);
        setFilteredProducts(data.data);
        console.log(`Warehouse Product: ${data}`);
      } else {
        // Si llega una respuesta válida pero sin datos
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err: any) {
      console.error("Error al cargar productos:", err);

      // Si el error es 204 (sin contenido)
      if (err.response?.status === 204) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      // Otros errores
      setError(
        err.response?.data?.message ||
          err.message ||
          "Ocurrió un error al obtener los productos."
      );
    }
  };

  // Filtrar productos en tiempo real
  const filterProducts = () => {
    const filtered = products.filter((product) =>
      [product.title, product.id.toString(), product.id_mlc].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProducts(filtered);
  };

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    if (id) {
      fetchWarehouse(id);
      fetchProducts(id);
    }
  }, [id]);

  // Efecto para filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  // Renderizar errores
  if (error) {
    return <p className="text-danger">Error: {error}</p>;
  }

  // Renderizar indicador de carga
  if (!warehouse) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className="container-fluid">
      {/* Información de la bodega */}
      <h1 className="mt-2 mb-2">Atributos de Bodega</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Nombre Compañía</th>
              <th>Fecha de creación</th>
              <th>Fecha de modificación</th>
            </tr>
          </thead>
          <tbody>
            <tr key={warehouse.id}>
              <td>{warehouse.id}</td>
              <td>{warehouse.name}</td>
              <td>{warehouse.location}</td>
              <td>{warehouse.company?.name}</td>
              <td>
                {new Date(warehouse.created_at).toLocaleDateString("es-CL")}
              </td>
              <td>
                {new Date(warehouse.updated_at).toLocaleDateString("es-CL")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Productos en la bodega */}
      <h1 className="mt-2 mb-2">Productos en la Bodega</h1>
      <input
        type="text"
        placeholder="Buscar por ID, Título o Código de Categoría"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Base de Datos</th>
              <th>Imágen</th>
              <th>Título</th>
              <th>ID MLC</th>
              <th>Precio CLP</th>
              <th>Stock MercadoLibre</th>
              <th>Bodega Asignada</th>
              <th>Stock Bodega</th>
              <th>Fecha Creación</th>
              <th>Fecha Actualización</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td style={{ textAlign: "center" }}>
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      style={{ width: "50px", height: "50px" }}
                      onError={(e) => (e.currentTarget.src = placeholderImage)}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>{product.id_mlc}</td>
                  <td>
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(Number(product.price_clp))}
                  </td>
                  <td>{product.warehouse_stock}</td>
                  <td>{product.warehouse_id}</td>
                  <td>{product.warehouse_stock}</td>
                  <td>
                    {new Date(product.created_at).toLocaleString("es-CL")}
                  </td>
                  <td>
                    {new Date(product.updated_at).toLocaleString("es-CL")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-muted">
                  No hay productos registrados en esta bodega.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón para volver */}
      <div style={{ textAlign: "right" }}>
        <Link to="/sync/bodegas/home" className="btn btn-secondary mt-3 mb-4">
          Volver a bodegas
        </Link>
      </div>
    </div>
  );
};

export default DetalleBodega;
