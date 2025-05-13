import { useEffect, useState } from "react";
import { Table, InputNumber, Button, message, Typography } from "antd";
import axios from "axios";

const { Title } = Typography;

const EditarProductos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [stockEditado, setStockEditado] = useState<Record<string, number>>({});

  const perPage = 100;
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  const fetchProductos = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/all-products/${conexion.client_id}`,
        {
          params: { page, per_page: perPage },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos(data.results || []);
      setTotal(data.paging?.total || 0);
    } catch (error) {
      message.error("Error al cargar productos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarStock = async (productId: string) => {
    const nuevoStock = stockEditado[productId];
    if (nuevoStock == null) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${productId}`,
        { available_quantity: nuevoStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Stock actualizado");
    } catch (err) {
      message.error("Error al actualizar stock");
      console.error(err);
    }
  };

  useEffect(() => {
    if (conexion.client_id) {
      fetchProductos(pagina);
    }
  }, [pagina]);

  const columns = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (text: any) => `$${text}`,
    },
    {
      title: "Stock",
      dataIndex: "available_quantity",
      key: "stock",
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          defaultValue={record.available_quantity}
          onChange={(value) =>
            setStockEditado((prev) => ({ ...prev, [record.id]: value }))
          }
        />
      ),
    },
    {
      title: "Acción",
      key: "action",
      render: (_: any, record: any) => (
        <Button onClick={() => actualizarStock(record.id)}>Actualizar</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>Productos Publicados en MercadoLibre</Title>

      <Table
        dataSource={productos}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagina,
          pageSize: perPage,
          total: total,
          onChange: (page) => setPagina(page),
        }}
      />
    </div>
  );
};

export default EditarProductos;
