// Ventas/TablaVentas.tsx
import React from "react";
import { Table } from "react-bootstrap";

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

interface Props {
  ventas: Venta[];
  formatCurrency: (valor: number) => string;
}

const TablaVentas: React.FC<Props> = ({ ventas, formatCurrency }) => {
  return (
    <Table striped bordered hover responsive className="mt-4 table-primary">
      <thead className="table-primary">
        <tr>
          <th>ID Orden</th>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        {ventas.length > 0 ? (
          ventas.map((venta, index) => (
            <tr key={index} className="table-light">
              <td>{venta.order_id}</td>
              <td>{venta.order_date}</td>
              <td>{venta.title}</td>
              <td>{venta.quantity}</td>
              <td>{formatCurrency(venta.price)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="text-center">
              No hay datos disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default TablaVentas;
