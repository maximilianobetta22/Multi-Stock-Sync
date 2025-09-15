import { Card, Form, Input, InputNumber, Button, Table, Popconfirm } from "antd";
import { useProductSheet, Product } from "../hook/useProductSheet";

export const ProductSheetCard = () => {
  const { products, addProduct, removeProduct, updateProduct, exportToExcel, getTotal } =
    useProductSheet();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    addProduct({
      category_id: values.category_id,
      title: values.title,
      sku: values.sku,
      attributes: { BRAND: values.brand, GENDER: values.gender },
      price: values.price,
      currency_id: "CLP",
      quantity: values.quantity,
      description: values.description,
      images: values.images || [],
    });
    form.resetFields();
  };

  const columns = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: Product) => (
        <Input
          value={record.title}
          onChange={(e) => updateProduct(record.id, "title", e.target.value)}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (_: any, record: Product) => (
        <Input
          value={record.sku}
          onChange={(e) => updateProduct(record.id, "sku", e.target.value)}
        />
      ),
    },
    {
      title: "Marca",
      dataIndex: ["attributes", "BRAND"],
      key: "brand",
      render: (_: any, record: Product) => (
        <Input
          value={record.attributes.BRAND}
          onChange={(e) =>
            updateProduct(record.id, "attributes", { ...record.attributes, BRAND: e.target.value })
          }
        />
      ),
    },
    {
      title: "Género",
      dataIndex: ["attributes", "GENDER"],
      key: "gender",
      render: (_: any, record: Product) => (
        <Input
          value={record.attributes.GENDER}
          onChange={(e) =>
            updateProduct(record.id, "attributes", { ...record.attributes, GENDER: e.target.value })
          }
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: Product) => (
        <InputNumber
          value={record.price}
          min={0}
          onChange={(value) => updateProduct(record.id, "price", value || 0)}
        />
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: any, record: Product) => (
        <InputNumber
          value={record.quantity}
          min={1}
          onChange={(value) => updateProduct(record.id, "quantity", value || 1)}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Product) => (
        <Popconfirm title="¿Eliminar producto?" onConfirm={() => removeProduct(record.id)}>
          <Button danger size="small">
            Eliminar
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="Planilla de Productos" style={{ marginTop: 20 }}>
      <Form form={form} layout="inline" onFinish={onFinish}>
        <Form.Item name="category_id" rules={[{ required: true, message: "Ingresa la categoría" }]}>
          <Input placeholder="ID Categoría" />
        </Form.Item>
        <Form.Item name="title" rules={[{ required: true, message: "Ingresa el título" }]}>
          <Input placeholder="Título" />
        </Form.Item>
        <Form.Item name="sku" rules={[{ required: true, message: "Ingresa el SKU" }]}>
          <Input placeholder="SKU" />
        </Form.Item>
        <Form.Item name="brand" rules={[{ required: true, message: "Ingresa la marca" }]}>
          <Input placeholder="Marca" />
        </Form.Item>
        <Form.Item name="gender" rules={[{ required: true, message: "Ingresa el género" }]}>
          <Input placeholder="Género" />
        </Form.Item>
        <Form.Item name="price" rules={[{ required: true, message: "Ingresa el precio" }]}>
          <InputNumber placeholder="Precio" min={0} />
        </Form.Item>
        <Form.Item name="quantity" rules={[{ required: true, message: "Ingresa la cantidad" }]}>
          <InputNumber placeholder="Cantidad" min={1} />
        </Form.Item>
        <Form.Item name="description">
          <Input placeholder="Descripción" />
        </Form.Item>
        <Form.Item name="images">
          <Input placeholder="URLs de imágenes (separadas por coma)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Agregar</Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{ marginTop: 20 }}
        footer={() => <b>Total: ${getTotal()}</b>}
      />

      <Button type="default" onClick={exportToExcel} style={{ marginTop: 20 }}>
        Exportar a Excel
      </Button>
    </Card>
  );
  

};

export default ProductSheetCard;
