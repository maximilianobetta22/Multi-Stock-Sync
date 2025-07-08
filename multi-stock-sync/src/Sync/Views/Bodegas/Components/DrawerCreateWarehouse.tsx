import React from "react";
import { useCreateManagements } from "../Hooks/useCreateManagements";
import { Button, Drawer, Form, Input, Select } from "antd";
import styles from "../Views/Home/HomeBodega.module.css";

interface DrawerCreateWarehouseProps {
  onWarehouseCreated: () => void;
}

export const DrawerCreateWarehouse: React.FC<DrawerCreateWarehouseProps> = ({
  onWarehouseCreated,
}) => {
  const { createWarehouse, loading, fetchCompanies, companies } =
    useCreateManagements();
  const [open, setOpen] = React.useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

const onFinish = async (values: any) => {
  try {
    await createWarehouse(values);     //  Esperar que termine
    onWarehouseCreated();              //  Refrescar después
    setOpen(false);                    //  (Opcional) Cierra el drawer
  } catch (error) {
    console.error(`Error al crear Bodega: ${error}`);
  }
};

  React.useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies(); // Solo llamar si no hay compañías cargadas
    }
  }, [companies, fetchCompanies]);

  return (
    <>
      <button className={styles.create_button} onClick={showDrawer}>
        Crear Bodega
      </button>
      <Drawer title="Crear Bodega" onClose={onClose} open={open} width={400}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nombre Bodega"
            name="name"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el Nombre de Bodega.",
              },
            ]}
          >
            <Input placeholder="Ingresa el nombre de la bodega" />
          </Form.Item>
          <Form.Item
            label="Ubicación de la bodega"
            name="location"
            rules={[
              {
                required: true,
                message: "Por favor ingresa la ubicación de la bodega.",
              },
            ]}
          >
            <Input placeholder="Ingresa la ubicación de la bodega" />
          </Form.Item>
          <Form.Item
            label="Compañia Asignada"
            name="assigned_company_id"
            rules={[
              {
                required: true,
                message: "Por favor ingresa la compañia.",
              },
            ]}
          >
            <Select placeholder="Seleccione un cliente">
              {companies.map((company) => (
                <Select.Option key={company.id} value={company.id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Bodega
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
