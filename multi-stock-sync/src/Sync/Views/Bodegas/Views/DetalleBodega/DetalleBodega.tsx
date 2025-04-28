import styles from "./DetalleBodega.module.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
<<<<<<< HEAD
import { Product } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMapPin,
  faWarehouse,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Table, Input } from "antd";
import DrawerCreateProduct from "../../Components/DrawerCreateProduct";
=======
import { Warehouse, Product } from "../../Types/warehouse.type";

interface ApiResponseWarehouse {
  message: string;
  data: Warehouse;
}
interface ApiResponseProducts {
  message: string;
  data: Product[];
}
>>>>>>> f9783009dd161be1be6515d1d6eb7c8532528219

const DetalleBodega = () => {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const placeholderImage = "/assets/img/icons/image_notfound.svg";

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/warehouses/${id}`
        );
        const data: ApiResponseWarehouse = await response.json();

        if (response.ok) {
          setWarehouse(data.data);
        } else {
          setError(data.message || "Error al obtener los datos de la bodega.");
        }
      } catch (err) {
        setError("Ocurrió un error inesperado al cargar la bodega.");
        console.error(err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/warehouses-stock/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const data: ApiResponseProducts = await response.json();

        if (response.ok) {
          setProducts(data.data);
        } else {
          setError(data.message || "Error al obtener los productos.");
        }
      } catch (err) {
        setError("Ocurrió un error inesperado al cargar los productos.");
        console.error(err);
      }
    };

    fetchWarehouse();
    fetchProducts();
  }, [id]);

  const filteredProducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm) ||
      product.id_mlc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!warehouse) {
    return <LoadingDinamico variant="container" />;
  }

  return (
<<<<<<< HEAD
    <div className="container-fluid bg-body-tertiary h-100">
      {/* Botón para regresar */}
      <Button htmlType="button" className="my-2">
        <Link to="../homebodega">
          <FontAwesomeIcon icon={faArrowLeft} /> regresar
        </Link>
      </Button>
      <div className="row mx-3 my-3">
        <div
          className={`col-md-6 py-4 px-4 ${styles.round_left} ${styles.own_bg_white}`}
        >
          <Card style={{ width: "100%" }}>
            <h2 className="my-4">Bodega</h2>
            <Card title="Nombre de la Bodega" className="my-2 px-2">
              <FontAwesomeIcon icon={faWarehouse} /> {warehouse.name}
            </Card>
            <Card title="Compañia Asiganada" className="my-2 px-2">
              <FontAwesomeIcon icon={faBuilding} /> {warehouse.company?.name}
            </Card>
            <Card title="Ubicación de Bodega" className="my-2 px-2">
              <FontAwesomeIcon icon={faMapPin} /> {warehouse.location}
            </Card>
          </Card>
        </div>
        <div
          className={`col-md-6 py-4 px-4 ${styles.own_bg_white} ${styles.round_rigth}`}
        >
          <Card className="h-100">
            <div className="row">
              <div className="col-sm-6">
                <h2 className="my-4">Productos Bodega</h2>
              </div>
              <div className="col-sm-6 d-flex justify-content-end">
                <DrawerCreateProduct
                  warehouseId={id ?? ""}
                  warehouseCompanyId={warehouse.company?.client_id}
                  onProductCreated={() => id && fetchProducts(id)}
                />
              </div>
            </div>
            <Search
              placeholder="Buscar por Titulo o MLC"
              onSearch={onSearch}
              enterButton
              className="my-2"
            />
            <Table dataSource={dataSource} columns={columns} size="small" />
          </Card>
=======
    <div>
      <div className="container-fluid">
        <h1 className="mt-2 mb-2">Atributos de Bodega</h1>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className="table_header">ID</th>
                <th className="table_header">Nombre</th>
                <th className="table_header">Ubicación</th>
                <th className="table_header">Nombre Compañía</th>
                <th className="table_header">Fecha de creación</th>
                <th className="table_header">Fecha de modificación</th>
              </tr>
            </thead>
            <tbody>
              <tr key={warehouse.id}>
                <td>{warehouse.id}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.location}</td>
                <td>{warehouse.company.name}</td>
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

        <h1 className="mt-2 mb-2">Productos en la Bodega</h1>
        <input
          type="text"
          placeholder="Buscar por ID, Título o Código de Categoría"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginBottom: "10px",
            padding: "5px",
            width: "100%",
            maxWidth: "500px",
          }}
        />
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className="table_header">ID Base de Datos</th>
                <th className="table_header">Imágen</th>
                <th className="table_header">Título</th>
                <th className="table_header">ID MLC</th>
                <th className="table_header">Precio CLP</th>
                <th className="table_header">Stock MercadoLibre</th>
                <th className="table_header">Bodega Asignada</th>
                <th className="table_header">Stock Bodega</th>
                <th className="table_header">Fecha Creación</th>
                <th className="table_header">Fecha Actualización</th>
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
                        onError={(e) =>
                          (e.currentTarget.src = placeholderImage)
                        }
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
                      {new Date(product.created_at).toLocaleString("es-CL")}
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

        <div style={{ textAlign: "right" }}>
          <Link to="/sync/bodegas/home" className="btn btn-secondary mt-3 mb-4">
            Volver a bodegas
          </Link>
>>>>>>> f9783009dd161be1be6515d1d6eb7c8532528219
        </div>
      </div>
    </div>
  );
};

export default DetalleBodega;
