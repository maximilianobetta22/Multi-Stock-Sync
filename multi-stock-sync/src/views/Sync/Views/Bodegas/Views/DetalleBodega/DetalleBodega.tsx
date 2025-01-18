import styles from './DetalleBodega.module.css';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
//import {  faArrowDown } from '@fortawesome/free-solid-svg-icons';

//Si ven la tabla, veran que hay un campo adicional (que no esta incluido en la interfaz) para producto llamado
//"Bodega asignada" , por defecto este campo se llena con el dato "no especificado"
//Ya que me guie por la logica del archivo HomeProducto.tsx de la vista productos 
interface Product {
  id: number;
  title: string;
  category_code: string;
  price_clp: number;
  stock_mercado_libre: number;
  warehouse_stock: number;
  image_url: string;
  mercadolibre_url: string;
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

interface ApiResponse {
  message: string;
  data: Warehouse;
}

const DetalleBodega = () => {
  // OBTENER EL ID DE LA URL
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // Estado para productos estáticos
  const [error, setError] = useState<string | null>(null);
  const [showWarehouseDetails] = useState(true);
  // OBTENER LOS DATOS DE LA API
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/warehouses/${id}`
        );
        const data: ApiResponse = await response.json();

        if (response.ok) {
          setWarehouse(data.data);
        } else {
          setError(data.message || "Error al obtener los datos de la bodega");
        }
      } catch (err) {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
        console.error(err);
      }
    };

    // DATOS ESTATICOS DE PRUEBA
    const staticProducts: Product[] = [
      {
        id: 101,
        title: "Producto A", 
        category_code: "MLC1010101", 
        price_clp: 15000, 
        stock_mercado_libre: 20, 
        warehouse_stock: 50, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg",
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#", 
      },
      {
        id: 102, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 103, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 104, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 105, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 1090, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 123, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 1231212, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
      {
        id: 999, 
        title: "Producto B", 
        category_code: "MLC1010101", 
        price_clp: 25000, 
        stock_mercado_libre: 15, 
        warehouse_stock: 40, 
        image_url: "https://www.sportcom.cl/wp-content/uploads/2019/04/M.20.50-1.jpg", 
        mercadolibre_url: "https://www.sportcom.cl/tienda/recreacion/paletas-de-playa-2-pelotas/#",
      },
    ];

    setProducts(staticProducts); //ESTO ES PORQUE SON ESTATICOS, ELIMINAR LINEA CUANDO SE LLAMEN DE API
    fetchWarehouse();
  }, [id]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!warehouse) {
    return <p>Cargando información...</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h1 className="mt-2 mb-2">Atributos de Bodega </h1>
      </div>

      {/* Condición para mostrar los detalles */}
      {showWarehouseDetails && (
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
      )}
      <div className={`${styles.header} ${styles.tableContainer2}`}>
        {/*Tabla "inspirada" por la tabla en HomeProducto.tsx */}
        <h1 className="mt-2 mb-2">Productos en la Bodega</h1>
        {products.length === 0 ? (
          <p>No hay productos registrados en esta bodega.</p>
        ) : (
          
          <table
          className={styles.table} 
            
          >
            
            
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
                <th className="table_header">URL MercadoLibre</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{ width: "50px", height: "50px" }}
                    />
                  </td>
                  <td>{product.id}</td>
                  <td>{product.title}</td>
                  <td>{product.category_code}</td>
                  <td>{product.price_clp.toLocaleString("es-CL")}</td>
                  <td>{product.stock_mercado_libre}</td>
                  <td>no especificada</td>
                  <td>{product.warehouse_stock}</td>
                  
                  <td><Link to={product.mercadolibre_url} target="_blank" className='btn btn-warning'>Ver producto</Link></td>
                  
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
