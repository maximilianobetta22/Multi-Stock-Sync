import React, { useState } from "react";
import { Form, Input, Button, InputNumber, Select, message, Card, Typography, Space, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

const CrearProducto: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [atributosCategoria, setAtributosCategoria] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [familyName, setFamilyName] = useState<string>("");

  // Función para limpiar caracteres especiales del título
  const sanitizeTitle = (title: string) => {
    return title.replace(/[^a-zA-Z0-9 ]/g, "").trim();  // Elimina caracteres no alfanuméricos
  };

  // Función para validar y asegurar que el título sea adecuado
  const validateTitle = (title: string) => {
    let sanitizedTitle = sanitizeTitle(title);

    // Limitar el título a 60 caracteres
    if (sanitizedTitle.length > 60) {
      sanitizedTitle = sanitizedTitle.slice(0, 60); // Truncar a 60 caracteres
      message.warning("El título fue truncado a 60 caracteres.");
    }

    return sanitizedTitle;
  };

  // Función para predecir la categoría del producto
  const predecirCategoria = async (titulo: string) => {
    try {
      const response = await axios.get(
        "https://api.mercadolibre.com/sites/MLC/domain_discovery/search",
        {
          params: { q: titulo, limit: 1 },
        }
      );

      if (response.data.length > 0) {
        const categoria = response.data[0].category_id;
        setCategoryId(categoria);
        form.setFieldsValue({ category_id: categoria });

        // Cargar atributos de la categoría
        const atributosRes = await axios.get(
          `https://api.mercadolibre.com/categories/${categoria}/attributes`
        );
        setAtributosCategoria(atributosRes.data);
        message.success(`Categoría encontrada: ${categoria}`);

        // Obtener el family_name de la categoría
        const family = response.data[0].family_name || "default_family"; // Asignar valor predeterminado si no se obtiene
        setFamilyName(family);
      } else {
        message.error("No se pudo predecir la categoría.");
      }
    } catch (error) {
      console.error("Error al predecir la categoría:", error);
      message.error("Error al predecir la categoría.");
    }
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    if (titulo.length > 4) {
      predecirCategoria(titulo);
    }
  };

  const onFinish = async (values: any) => {
    const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
    if (!conexion?.client_id) {
      return message.error("No se ha seleccionado una tienda.");
    }

    const atributosPlano = Object.entries(values.attributes || {}).map(([id, value_name]) => ({
      id,
      value_name,
    }));

    // Validar y sanitizar el título
    let titulo = validateTitle(values.title);

    // Verificar que el título no esté vacío
    if (!titulo || titulo.trim() === "") {
      return message.error("El título del producto es obligatorio.");
    }

    const payload = {
      title: titulo,  // Usar el título validado
      category_id: categoryId,
      condition: values.condition,
      price: values.price,
      currency_id: values.currency_id,
      available_quantity: values.quantity,
      description: values.description,
      listing_type_id: values.listing_type_id,
      pictures: imagenes.map((src) => ({ source: src })),
      sale_terms: [
        { id: "WARRANTY_TYPE", value_name: values.warranty_type || "Garantía del vendedor" },
        { id: "WARRANTY_TIME", value_name: values.warranty_time || "90 días" },
      ],
      shipping: {
        mode: "me2",
        local_pick_up: values.local_pick_up || false,
        free_shipping: values.free_shipping || false,
      },
      attributes: atributosPlano,
      family_name: familyName || "default_family",  // Asegurándonos de que se pase el family_name correctamente
    };

    console.log("Enviando solicitud con payload:", payload);  // Log de depuración

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/mercadolibre/Products/${conexion.client_id}/crear-producto`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      message.success("✅ Producto subido con éxito a Mercado Libre");
      form.resetFields();
      setImagenes([]);
      setAtributosCategoria([]);
    } catch (error: any) {
      console.error("🔴 Error detallado:", error.response?.data || error);
      message.error("Hubo un error al subir el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarImagen = () => {
    const url = prompt("Ingresa el URL de la imagen (MercadoLibre solo acepta links públicos):");
    if (url) {
      setImagenes((prev) => [...prev, url]);
      message.success("✅ Imagen agregada correctamente");
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title level={3}>Subir Producto a Mercado Libre</Title>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="title" label="Título" rules={[{ required: true }]}>
          <Input onChange={onTitleChange} />
        </Form.Item>

        <Form.Item name="category_id" label="Categoría (ID)" rules={[{ required: true }]}>
          <Input placeholder="Se completará automáticamente si es posible" disabled />
        </Form.Item>

        <Form.Item name="condition" label="Condición" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="new">Nuevo</Select.Option>
            <Select.Option value="used">Usado</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="price" label="Precio" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="currency_id" label="Moneda" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="CLP">CLP</Select.Option>
            <Select.Option value="USD">USD</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="quantity" label="Cantidad" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="listing_type_id" label="Tipo de publicación" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="gold_special">Clásica</Select.Option>
            <Select.Option value="gold_pro">Premium</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Descripción" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Imágenes agregadas">
          <ul>
            {imagenes.map((src, idx) => (
              <li key={idx}>
                <a href={src} target="_blank" rel="noreferrer">
                  {src}
                </a>
              </li>
            ))}
          </ul>
          <Button icon={<UploadOutlined />} onClick={handleAgregarImagen}>
            Agregar imagen por URL
          </Button>
        </Form.Item>

        <Form.Item name="warranty_type" label="Tipo de Garantía">
          <Input placeholder="Ej: Garantía del vendedor" />
        </Form.Item>

        <Form.Item name="warranty_time" label="Duración de Garantía">
          <Input placeholder="Ej: 90 días" />
        </Form.Item>

        <Space>
          <Form.Item name="local_pick_up" label="¿Permite retiro en persona?" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="free_shipping" label="¿Envío gratis?" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>

        {atributosCategoria
          .filter((attr) => attr.tags?.required || attr.tags?.catalog_required)
          .map((attr) => {
            const esLista = attr.value_type === "list" && attr.values?.length > 0;
            return (
              <Form.Item
                key={attr.id}
                name={['attributes', attr.id]}
                label={attr.name}
                rules={[{ required: true, message: `Este campo es obligatorio` }]} >
                {esLista ? (
                  <Select showSearch optionFilterProp="children">
                    {attr.values.map((v: any) => (
                      <Select.Option key={v.id} value={v.name}>
                        {v.name}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input placeholder={attr.hint || `Ingrese ${attr.name.toLowerCase()}`} />
                )}
              </Form.Item>
            );
          })}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Subir producto
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CrearProducto;
