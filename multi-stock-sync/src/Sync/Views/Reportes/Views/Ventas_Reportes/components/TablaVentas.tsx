// Ventas_Reportes/components/TablaVentas.tsx
import React from 'react';
import { Table } from 'react-bootstrap';

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

interface Props {
  ventas: Venta[];
  total: number;
}

const TablaVentas: React.FC<Props> = ({ ventas, total }) => {
  const formatCLP = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="table-responsive mt-4">
      <Table striped bordered hover>
        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length ? (
            ventas.map((venta, idx) => (
              <tr key={idx}>
                <td>{venta.order_id}</td>
                <td>{venta.order_date}</td>
                <td>{venta.title}</td>
                <td>{venta.quantity}</td>
                <td>{formatCLP(venta.price)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">No hay ventas</td>
            </tr>
          )}
        </tbody>
      </Table>
      <h5 className="text-center mt-3">
        Total: {formatCLP(total)}
      </h5>
    </div>
  );
};

export default TablaVentas;
