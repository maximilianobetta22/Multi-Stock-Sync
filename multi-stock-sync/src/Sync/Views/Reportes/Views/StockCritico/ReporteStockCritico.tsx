import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, Alert, Typography } from "antd";
import { stockCriticoService } from "./stockCriticoService";

const { Title } = Typography;

const ReporteStockCritico: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Al cargar el componente, traer productos en stock crítico
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!client_id) throw new Error("Falta client_id en la URL");

        const data = await stockCriticoService.obtener(client_id);
        setProductos(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar stock crítico");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client_id]);

  // Definición de las columnas de la tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Stock", dataIndex: "available_quantity", key: "available_quantity" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (val: number | undefined) =>
        typeof val === "number"
          ? new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(val)
          : "No disponible",
    },
    {
      title: "Última Venta",
      dataIndex: "purchase_sale_date",
      key: "purchase_sale_date",
      render: (val: string | undefined) =>
        val
          ? new Date(val).toLocaleString("es-CL")
          : "No disponible",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Reporte de Stock Crítico
      </Title>

      {/* Manejo de estados: loading, error y éxito */}
      {loading ? (
        <Spin />
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <Table
          dataSource={productos}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No hay productos con stock menor a 5." }}
        />
      )}
    </div>
  );
};

export default ReporteStockCritico;
//este componente es un reporte de stock crítico que muestra una tabla con los productos que tienen stock menor a 5. Se utiliza React y Ant Design para el diseño y la funcionalidad. El componente utiliza el hook useParams para obtener el ID del cliente de la URL. También se maneja el estado de carga, error y éxito al cargar los datos desde el servicio correspondiente.
// Se utiliza el servicio stockCriticoService para obtener los datos de los productos y se muestra un mensaje de error si no se pueden cargar. La tabla muestra el ID, título, stock, precio y última venta de cada producto. Se utiliza la función Intl.NumberFormat para formatear el precio en pesos chilenos y la función toLocaleString para formatear la fecha de la última venta.