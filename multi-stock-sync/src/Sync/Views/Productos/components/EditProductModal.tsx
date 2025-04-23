import { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Typography,
} from "antd";
import { Product } from "../types/product.type";
import { productService } from "../service/productService";

const { Option } = Select;
const { Title } = Typography;

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  onClose,
  product,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        title: product.title,
        price: product.price,
        available_quantity: product.available_quantity,
        thumbnail: product.thumbnail,
        status: product.status,
      });
    }
  }, [product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!product) return;

      await productService.updateProduct({
        ...product,
        title: values.title,
        price: values.price,
        available_quantity: values.available_quantity,
        thumbnail: values.thumbnail,
        status: values.status,
      } as Product); // 👈 fuerza el tipo correcto

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error actualizando producto:", error);
    }
  };

  return (
    <Drawer
      title={<Title level={4}>Editar Producto</Title>}
      width={480}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="title"
          label="Título"
          rules={[{ required: true, message: "Ingrese un título" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Precio"
          rules={[{ required: true, message: "Ingrese el precio" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          name="available_quantity"
          label="Stock Disponible"
          rules={[{ required: true, message: "Ingrese el stock" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="thumbnail" label="Imagen (URL)">
          <Input />
        </Form.Item>

        <Form.Item name="status" label="Estado">
          <Select>
            <Option value="active">Activo</Option>
            <Option value="paused">Pausado</Option>
            <Option value="under_review">En Revisión</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="primary" onClick={handleSubmit}>
              Guardar Cambios
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditProductModal;
