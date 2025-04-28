
import React from "react";
import { Table } from "react-bootstrap";

// Tipado para cada venta
interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

// Tipado para las props del componente
interface Props {
  ventas: Venta[];
  total: number;
}

// Tabla que lista ventas individuales con total al final
const TablaVentas: React.FC<Props> = ({ ventas, total }) => {
  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);

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
              <td colSpan={5} className="text-center">
                No hay ventas
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      
      {/* Total de ingresos */}
      <h5 className="text-center mt-3">
        Total: {formatCLP(total)}
      </h5>
    </div>
  );
};

export default TablaVentas;
// Este componente es una tabla que muestra las ventas individuales y el total de ingresos en una aplicación React. Se utiliza Bootstrap para el estilo de la tabla y se formatean los valores monetarios en pesos chilenos (CLP).
// Recibe como props un array de ventas y el total de ingresos. Cada venta tiene un ID, fecha, producto, cantidad y precio. La tabla es responsiva y se adapta a diferentes tamaños de pantalla. Si no hay ventas, se muestra un mensaje indicando que no hay ventas disponibles.