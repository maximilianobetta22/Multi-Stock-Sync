import React from "react";
import { Button, Drawer, Form, Input } from "antd";
import { useCreateManagements } from "../Hooks/useCreateManagements";
import styles from "./../Views/Home/HomeBodega.module.css";

interface DrawerCreateProductProps {
  onProductCreated: () => void; // Callback para notificar la creación de un producto
  warehouseId: string;
  warehouseCompanyId: string;
}

const DrawerCreateProduct: React.FC<DrawerCreateProductProps> = ({
  onProductCreated,
  warehouseId,
  warehouseCompanyId,
}) => {
  const { createProduct, loading, fetchCompanies, companies } =
    useCreateManagements(); // Importar la función desde el hook
  const [open, setOpen] = React.useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onFinish = async (values: any) => {
    const company = companies.find(
      (companie) => warehouseCompanyId === companie.client_id
    );
    const company_id = company ? company.client_id : null;
    if (!company_id) {
      console.error("No se encontró un company_id válido.");
      return;
    }

    try {
      const payload = {
        ...values,
        warehouse_id: warehouseId,
        client_id: company_id,
      };
      await createProduct(payload);
      console.log("Producto creado exitosamente");
      setOpen(false); // Cerrar el Drawer después de crear el producto
      onProductCreated();
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  React.useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies]);

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
            label="Stock"
            name="stock"
            rules={[{ required: true, message: "Por favor ingresa el stock" }]}
          >
            <Input type="number" placeholder="Ingresa el stock" />
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
