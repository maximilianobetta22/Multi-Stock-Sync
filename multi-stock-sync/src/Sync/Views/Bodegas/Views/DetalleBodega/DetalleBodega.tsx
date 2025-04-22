import styles from "./DetalleBodega.module.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Product } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Button, List } from "antd";
import TablaProductoBodega from "../../Components/tablaProductoBodega";

const DetalleBodega = () => {
  const { id } = useParams<{ id: string }>();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchWarehouse, warehouse, error, products, fetchProducts } =
    useWarehouseManagement();

  const placeholderImage = "/assets/img/icons/image_notfound.svg";

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
    <div className="container-fluid bg-body-tertiary h-100">
      {/* Botón para regresar */}
      <Button htmlType="button" className="my-2">
        <Link to="../homebodega">
          <FontAwesomeIcon icon={faArrowLeft} /> regresar
        </Link>
      </Button>
      <div className="row mx-3">
        <div
          className={`col-md-6 py-4 px-4 ${styles.round_left} ${styles.own_bg_white}`}
        >
          <h3 className="my-2">Bodega</h3>
          <List
            itemLayout="horizontal"
            dataSource={warehouse ? [warehouse] : []}
            renderItem={(item) => (
              <List.Item>
                <div>
                  <h5>Nombre: {item.name || "No especificado"}</h5>
                  <p>Ubicación: {item.location || "No especificada"}</p>
                  <p>compañia: {item.company?.name || "No especificada"}</p>
                  <p>Estado: {item.updated_at || "No especificado"}</p>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div
          className={`col-md-6 py-4 px-4 ${styles.own_bg_white} ${styles.round_rigth}`}
        >
          <h3 className="my-2">Productos Bodega</h3>
          <TablaProductoBodega
            products={filteredProducts}
            placeholderImage={placeholderImage}
          />
        </div>
      </div>
    </div>
  );
};

export default DetalleBodega;
