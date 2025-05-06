import React from "react";
import { useEnviosManagement } from "../Hooks/useEnviosManagement";
import { Table, message, Tag, Input } from "antd";
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico";

export default function EnviosCancelados() {
  const { envios, loading, error, fetchEnviosCancelados } =
    useEnviosManagement();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchText] = React.useState<string>("");
  const { Search } = Input;

  React.useEffect(() => {
    const connection = JSON.parse(
      localStorage.getItem("conexionSeleccionada") || "{}"
    );
    if (connection && connection.client_id) {
      fetchEnviosCancelados(connection.client_id);
      messageApi.success("Productos cancelados obtenidos correctamente.");
    } else {
      messageApi.error("No se ha seleccionado una conexión válida.");
    }
  }, []);

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }
  if (error) {
    messageApi.error(error);
  }
  if (!envios || envios.length === 0) {
    messageApi.info("No hay envios cancelados disponibles");
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const columns = [
    {
      title: "Producto",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Precio Unitario",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Precio Total",
      dataIndex: "total_amount",
      key: "total_amount",
    },
    {
      title: "Fecha Cancelación",
      dataIndex: "cancellation_date",
      key: "cancellation_date",
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString("es-ES");
        return formattedDate;
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color="volcano">{status.toUpperCase()}</Tag>
      ),
    },
  ];

  const data = envios
    .map((envio: any) => ({
      key: envio.id,
      product: envio.product?.title,
      quantity: envio.product?.quantity,
      price: envio.product?.price,
      total_amount: envio.total_amount,
      cancellation_date: envio.created_date,
      status: envio.status,
    }))
    .filter((item) => item.product?.toLowerCase().includes(searchText));

  return (
    <div className="container-fluid h-100">
      {contextHolder}
      <h2>Envios Cancelados</h2>
      <div className="container-fluid d-flex justify-content-end my-2 h-100">
        <Search
          placeholder="Ingrese Nombre de Producto"
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
  