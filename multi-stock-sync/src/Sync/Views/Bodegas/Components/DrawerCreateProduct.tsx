import React from "react";
import { Button, Drawer, Form, Input, Select } from "antd";
import { useCreateManagements } from "../Hooks/useCreateManagements";
import styles from "./../Views/Home/HomeBodega.module.css";
import { Connection } from "../Types/warehouse.type";
import axiosInstance from "../../../../axiosConfig";

interface DrawerCreateProductProps {
  onProductCreated: () => void; // Callback para notificar la creación de un producto
}

const DrawerCreateProduct: React.FC<DrawerCreateProductProps> = ({
  onProductCreated,
}) => {
  const { createWarehouse, loading } = useCreateManagements(); // Importar la función desde el hook
  const [open, setOpen] = React.useState(false);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onFinish = async (values: any) => {
    try {
      await createWarehouse({
        name: values.name,
        location: values.stock,
        assigned_company_id: values.client_id,
      });
      console.log("Producto creado exitosamente");
      setOpen(false); // Cerrar el Drawer después de crear el producto
      onProductCreated();
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  async function fetchConnections(): Promise<Connection[]> {
    if (connections.length > 0) {
      return connections;
    }

    try {
      const url = `${process.env.VITE_API_URL}/mercadolibre/credentials`;
      console.log("URL generada:", url);

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      setConnections(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error en fetchConnections:", error);
      throw error;
    }
  }

  React.useEffect(() => {
    if (connections.length === 0) {
      fetchConnections();
    }
  }, [connections]);

  return (
    <>
      <button className={styles.create_button} onClick={showDrawer}>
        Crear Producto
      </button>
      <Drawer title="Crear Producto" onClose={onClose} open={open} width={400}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="ID MLC"
            name="id_mlc"
            rules={[{ required: true, message: "Por favor ingresa el ID MLC" }]}
          >
            <Input placeholder="Ingresa el ID MLC" />
          </Form.Item>
          <Form.Item
            label="ID de Bodega"
            name="warehouse_id"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el ID de la bodega",
              },
            ]}
          >
            <Input placeholder="Ingresa el ID de la bodega" />
          </Form.Item>
          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: "Por favor ingresa el stock" }]}
          >
            <Input type="number" placeholder="Ingresa el stock" />
          </Form.Item>
          <Form.Item
            label="ID del Cliente"
            name="client_id"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el ID del cliente",
              },
            ]}
          >
            <Select placeholder="Seleccione un cliente">
              {connections.map((connection) => (
                <Select.Option
                  key={connection.client_id}
                  value={connection.client_id}
                >
                  {connection.nickname}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Producto
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default DrawerCreateProduct;
