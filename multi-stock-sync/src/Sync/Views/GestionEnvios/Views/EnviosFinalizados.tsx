import React, { useEffect, useState } from "react";
import { Table, message, Spin } from "antd";
import axios from "axios";

interface Pedido {
  id: string;
  title: string;
  quantity: number;
  size: string;
  sku: string;
  estadoEnvio: string; // Puedes agregar más campos según el endpoint
}

const PedidosFinalizados: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPedidosFinalizados = async () => {
    const token = localStorage.getItem("token");
    const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

    if (!conexion?.client_id) {
      message.error("No hay conexión seleccionada.");
      return;
    }

    try {
      setLoading(true);

      // Refrescamos la conexión antes de hacer cualquier otra cosa
      await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${conexion.client_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Ahora pedimos los pedidos finalizados
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${conexion.client_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setPedidos(response.data.data || []);

    } catch (error) {
      console.error("Error al cargar pedidos finalizados:", error);
      message.error("No se pudieron cargar los pedidos finalizados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidosFinalizados();
  }, []);

  const columns = [
    {
      title: "ID Producto",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Nombre",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Talla",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Estado Envío",
      dataIndex: ["shipment_history", "status"],
      key: "estadoEnvio",
      render: (text: string) => text || "N/A",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={pedidos}
          bordered
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default PedidosFinalizados;
