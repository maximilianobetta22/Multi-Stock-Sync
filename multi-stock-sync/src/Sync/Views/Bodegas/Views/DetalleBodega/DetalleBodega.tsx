import styles from "./DetalleBodega.module.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
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

const DetalleBodega = () => {
  const { id } = useParams<{ id: string }>();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchWarehouse, warehouse, error, products, fetchProducts } =
    useWarehouseManagement();
  const placeholderImage = "/assets/img/icons/image_notfound.svg";
  const columns = [
    //establece el nombre de las columnas en la tabla y los valores a presentar
    { title: "Titulo", dataIndex: "title", key: "title" },
    {
      title: "ID MLC",
      dataIndex: "id_mlc",
      key: "id_mlc",
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (price: string | undefined) => {
        const numericPrice = parseFloat(price || ""); // Convertir el string a número
        return !isNaN(numericPrice) ? `$${numericPrice.toFixed(2)}` : "N/A"; // Validar y formatear
      },
    },
    {
      title: "Imagen",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img
          src={image || placeholderImage} // Mostrar imagen o un placeholder si no hay imagen
          alt="Producto"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    { title: "Stock bodega", dataIndex: "stock", key: "stock" },
  ];
  const dataSource = filteredProducts.map((product) => ({
    key: product.id,
    title: product.title,
    id_mlc: product.id_mlc,
    price: product.price_clp,
    image: product.thumbnail,
    stock: product.warehouse_stock,
  }));
  const { Search } = Input;

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

  const onSearch = (value: string) => {
    setSearchTerm(value); // Actualizar el término de búsqueda
    const filtered = products.filter((product) =>
      [product.title, product.id_mlc]
        .filter(Boolean) // Asegurarse de que los campos no sean null o undefined
        .some((field) => field.toLowerCase().includes(value.toLowerCase()))
    );

    setFilteredProducts(filtered);
  };

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
        </div>
      </div>
    </div>
  );
};

export default DetalleBodega;
