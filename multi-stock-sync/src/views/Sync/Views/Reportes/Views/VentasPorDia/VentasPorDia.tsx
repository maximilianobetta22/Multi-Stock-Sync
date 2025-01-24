import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import styles from './VentasPorDia.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

interface Producto {
  nombre: string;
  cantidad: number;
  fecha: string;
}

interface Order {
  sold_products: Producto[];
}

const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('2025-01-23');
  const [datosVentas, setDatosVentas] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/daily-sales/${client_id}`);
        const ventas = response.data.data;
        const ventasFormateadas = Object.keys(ventas).flatMap((key) =>
          ventas[key].orders ? ventas[key].orders.flatMap((order: Order) =>
            order.sold_products.map((product: Producto) => ({
              nombre: product.nombre,
              cantidad: product.cantidad,
              fecha: product.fecha.split('T')[0]
            }))
          ) : []
        );
        setDatosVentas(ventasFormateadas);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchVentas();
  }, [client_id]);


  const datosFiltrados = datosVentas.filter((venta: Producto) => venta.fecha === fechaSeleccionada);


  const data = {
    labels: datosFiltrados.map((producto: Producto) => producto.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: datosFiltrados.map((producto: Producto) => producto.cantidad),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
        tension: 0.1
      }
    ]
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `Ventas del ${new Date(fechaSeleccionada).toLocaleDateString('es-ES')}`
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Ventas por Día</h2>
      <Button variant="primary" onClick={() => setShowModal(true)}>Seleccionar Fecha</Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Fecha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>Aceptar</Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.tableContainer}>
      </div>
      <div style={{ width: '600px', height: '400px', marginTop: '2rem' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default VentasPorDia;
