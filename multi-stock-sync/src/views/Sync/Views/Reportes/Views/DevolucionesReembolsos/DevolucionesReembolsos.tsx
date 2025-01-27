import { useState, useEffect } from 'react';
import axios from 'axios';
import './DevolucionesReembolsos.module.css';

import { useParams } from 'react-router-dom';

interface Order {
  id: number;
  date_created: string;
  total_amount: number;
  status: string;
  title: string;
  quantity: number;
  price: number;
}

interface Category {
  category_id: string;
  total_refunds: number;
  orders: Order[];
}

const DevolucionesReembolsos = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');

  
  const { client_id } = useParams<{ client_id: string }>();  

  useEffect(() => {
    const fetchDevoluciones = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`;
        const response = await axios.get(url);

        
        if (response.data.status === 'success') {
          const fetchedCategories = Object.entries(response.data.data).map(
            ([key, value]: [string, any]) => ({
              category_id: key,
              total_refunds: value.total_refunds,
              orders: value.orders,
            })
          );
          setCategories(fetchedCategories);
        } else {
          throw new Error('Error en la respuesta de la API');
        }
      } catch (error) {
        console.error(error);
        setError('Hubo un problema al obtener los datos de la API.');
      }
    };

    fetchDevoluciones();
  }, [client_id]);

  return (
    <div className="devoluciones-container">
      <h1>Devoluciones por Categoría</h1>

      {error && <p className="error">{error}</p>}

      <table className="devoluciones-table">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Total Devoluciones</th>
            <th>Órdenes</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.category_id}>
              <td>{category.category_id}</td>
              <td>{category.total_refunds}</td>
              <td>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID de Orden</th>
                      <th>Fecha de Creación</th>
                      <th>Total Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.date_created).toLocaleString()}</td>
                        <td>{order.total_amount}</td>
                        <td>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DevolucionesReembolsos;
