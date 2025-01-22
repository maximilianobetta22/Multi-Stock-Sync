import styles from './DetalleBodega.module.css';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
//import { Link } from 'react-router-dom';
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
//Esto es el loading dinamico
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
//import {  faArrowDown } from '@fortawesome/free-solid-svg-icons';
/*
interface Product {
  id: number;
  title: string;
  category_code: string;
  price_clp: number;
  stock_mercado_libre: number;
  warehouse_stock: number;
  bodega_asignada:string;
  image_url: string;
  mercadolibre_url: string;
}*/
interface Product {
  id: number;
  thumbnail: string;
  id_mlc: string;
  title: string;
  price_clp: string;
  warehouse_stock: number;
  warehouse_id: number;
  created_at: string;
  updated_at: string;
}
//POR AHORA DE COMPANIA SOLO SACAMOS EL NAME

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
  assigned_company_id: number;
  created_at: string;
  updated_at: string;
  company: Company;
}
/*
interface ApiResponse {
  message: string;
  data: Warehouse;
}*/
interface ApiResponseWarehouse {
  message: string;
  data: Warehouse;
}
interface ApiResponseProducts {
  message: string;
  data: Product[];
}
const DetalleBodega = () => {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
          `${import.meta.env.VITE_API_URL}/warehouse-stock/${id}`
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
  /*FILTRO EXPERIMENTAL DE PRODUCTOS */
  const filteredProducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) || // Filtra por título
      product.id.toString().includes(searchTerm) || // Filtra por ID
      product.id_mlc.toLowerCase().includes(searchTerm.toLowerCase()) // Filtra por ID MLC
    );
  });
  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!warehouse) {
    return <LoadingDinamico variant="container" />
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h1 className="mt-2 mb-2">Atributos de Bodega </h1>
      </div>

      {/* Condición para mostrar los detalles */}
      
        <table className={styles.table}>
          <thead>
              <tr>
                <th className="table_header">ID</th>
                <th className="table_header">Nomrbe</th>
                <th className="table_header">Ubicacion</th>
                <th className="table_header">Nombre Compañia</th>
                <th className="table_header">Fecha de creacion</th>
                <th className="table_header">Fecha de modificacion</th>
                
              </tr>
            </thead>        
          <tbody>
          <tr key={warehouse.id}>
                
                <td>{warehouse.id}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.location}</td>
                <td>{warehouse.company.name}</td>
                <td>{new Date(warehouse.created_at).toLocaleDateString("es-CL")}</td>
                <td>{new Date(warehouse.updated_at).toLocaleDateString("es-CL")}</td>
                
              </tr>

          </tbody>
        </table>
      
      <div className={`${styles.header} ${styles.tableContainer2}`}>
        {/*Tabla "inspirada" por la tabla en HomeProducto.tsx */}
        <h1 className="mt-2 mb-2">Productos en la Bodega</h1>
        
        {products.length === 0 ? (
          <p></p>
        ) : (
        
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
                  }}/>
                )}
        {products.length === 0 ? (
          <p>No hay productos registrados en esta bodega.</p>
        ) : (
          
          <table className={styles.table} >
          {/* 
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
                  }}/>  */}
            
            <thead>
              <tr>
                <th className="table_header">Imágen</th>
                <th className="table_header">ID MLC</th>
                <th className="table_header">Título</th>
                <th className="table_header">Código Categoría</th>
                <th className="table_header">Precio CLP</th>
                <th className="table_header">Stock MercadoLibre</th>
                <th className="table_header">Bodega Asignada</th>
                <th className="table_header">Stock Bodega</th>
                <th className="table_header">Fecha Creación</th>
                <th className="table_header">Fecha Actualización</th>
              </tr>
            </thead>
            <tbody className="tbody2">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      style={{ width: "50px", height: "50px" }}
                    />
                  </td>
                  <td>{product.id}</td>
                  <td>{product.title}</td>
                  <td>{product.id_mlc}</td>
                  <td>{product.price_clp}</td>
                  <td>{product.warehouse_stock}</td>
                  <td>{product.warehouse_id}</td>
                  <td>{product.warehouse_stock}</td>
                  <td>{new Date(product.created_at).toLocaleDateString("es-CL")}</td>
                  <td>{new Date(product.updated_at).toLocaleDateString("es-CL")}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
    </div>
     
  );
};

export default DetalleBodega;
