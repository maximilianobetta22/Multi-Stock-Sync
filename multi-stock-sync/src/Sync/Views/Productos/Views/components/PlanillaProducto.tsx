import { useState } from "react";
import { Card, Form, Input, InputNumber, Button, Select, Table, Popconfirm, Space } from "antd";
import { useProductSheet, Product } from "../hook/useProductSheet";

const { Option } = Select;

export const ProductSheetCard = () => {
  const { products, addProduct, removeProduct, getTotal, exportToExcel } = useProductSheet();
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Categorías y subcategorías con atributos
  const categoryOptions: Record<string, any> = {
    Ropa: {
      subcategories: ["Camiseta", "Lencería", "Zapatilla"],
      attributes: ["Marca", "Género", "Talla", "Peso"],
    },
    Sabanas: {
      subcategories: ["King", "Queen", "Individual"],
      attributes: ["Material", "Color", "Peso"], 
    },
    Accesorios: {
      subcategories: ["Gorra", "Bolso", "Cinturón"],
      attributes: ["Marca", "Color", "Peso"],
    },
  };

  const onCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory("");
    form.resetFields(["subcategory", ...(categoryOptions[value]?.attributes || [])]);
  };

  const onSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    form.resetFields(categoryOptions[selectedCategory]?.attributes || []);
  };

  const onFinish = (values: any) => {
    const attributes: Record<string, any> = {};
    if (selectedCategory) {
      categoryOptions[selectedCategory].attributes.forEach((attr: string) => {
        // Ocultar Talla si es Zapatilla
        if (attr === "Talla" && selectedSubcategory === "Zapatilla") return;
        attributes[attr] = values[attr];
      });
    }

    addProduct({
      category: values.category,
      subcategory: values.subcategory,
      title: values.title,
      sku: values.sku,
      attributes,
      price: values.price,
      currency_id: "CLP",
      quantity: values.quantity,
      description: values.description,
      images: values.images ? values.images.split(",").map((i: string) => i.trim()) : [],
    });

    form.resetFields();
    setSelectedCategory("");
    setSelectedSubcategory("");
  };

  const columns = [
    { title: "Categoría", dataIndex: "category", key: "category" },
    { title: "Subcategoría", dataIndex: "subcategory", key: "subcategory" },
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Precio", dataIndex: "price", key: "price" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    { title: "Acciones", key: "actions", render: (_: any, record: Product) => (
        <Popconfirm title="¿Eliminar producto?" onConfirm={() => removeProduct(record.id)}>
          <Button danger size="small">Eliminar</Button>
        </Popconfirm>
      )
    },
  ];

  return (
    <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
      {/* Card izquierda: Formulario */}
      <Card title="Agregar Producto" style={{ flex: 1 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
            <Select placeholder="Selecciona categoría" onChange={onCategoryChange}>
              {Object.keys(categoryOptions).map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          {selectedCategory && (
            <>
              <Form.Item name="subcategory" label="Subcategoría" rules={[{ required: true }]}>
                <Select placeholder="Selecciona subcategoría" onChange={onSubcategoryChange}>
                  {categoryOptions[selectedCategory].subcategories.map((sub: string) => (
                    <Option key={sub} value={sub}>{sub}</Option>
                  ))}
                </Select>
              </Form.Item>

              {categoryOptions[selectedCategory].attributes.map((attr: string) => {
                // Ocultar Talla si es Zapatilla o Sabanas
                if ((attr === "Talla" && selectedSubcategory === "Zapatilla") || (attr === "Talla" && selectedCategory === "Sabanas")) {
                  return null;
                }

                return (
                  <Form.Item key={attr} name={attr} label={attr} rules={[{ required: true }]}>
                    {attr === "Peso" ? (
                      <Input placeholder="Ej: 1.5 kg" style={{ width: "100%" }} />
                    ) : attr === "Género" ? (
                      <Select placeholder="Selecciona género">
                        <Option value="Hombre">Hombre</Option>
                        <Option value="Mujer">Mujer</Option>
                        <Option value="Unisex">Unisex</Option>
                      </Select>
                    ) : attr === "Marca" ? (
                      <Select placeholder="Selecciona marca">
                        {selectedCategory === "Ropa" ? (
                          ["Nike", "Adidas", "Puma"].map((b) => <Option key={b} value={b}>{b}</Option>)
                        ) : selectedCategory === "Accesorios" ? (
                          ["Gucci", "Prada", "Fendi"].map((b) => <Option key={b} value={b}>{b}</Option>)
                        ) : (
                          <Option value="Marca X">Marca X</Option>
                        )}
                      </Select>
                    ) : attr === "Talla" || attr === "Tamaño" ? (
                      <Select placeholder="Selecciona talla">
                        {["XS","S","M","L","XL","XXL"].map((size) => (
                          <Option key={size} value={size}>{size}</Option>
                        ))}
                      </Select>
                    ) : (
                      <Input />
                    )}
                  </Form.Item>
                );
              })}
            </>
          )}

          <Form.Item name="title" label="Título" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="quantity" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input />
          </Form.Item>
          <Form.Item name="images" label="URLs de imágenes (separadas por coma)">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: 120 }}>
              Agregar
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Card derecha: Resumen */}
      <Card title="Resumen de Productos" style={{ flex: 1 }}>
        <Table dataSource={products} columns={columns} rowKey="id" pagination={false} />
        <Space style={{ marginTop: 10 }}>
          <Button
            type="primary"
            style={{ backgroundColor: "green", borderColor: "green" }}
            onClick={exportToExcel}
          >
            Exportar Excel
          </Button>
        </Space>
        <div style={{ marginTop: 10 }}><b>Total: ${getTotal()}</b></div>
      </Card>
    </div>
  );
};

export default ProductSheetCard;
