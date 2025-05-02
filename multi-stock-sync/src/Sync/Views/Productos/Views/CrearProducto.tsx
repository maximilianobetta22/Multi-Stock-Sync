import React, { useState, useRef } from "react";
import { Form, Input, Button, InputNumber, Select, message, Card, Typography, Space, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect } from "react"; // ya debería estar, pero asegúrate



const { Title } = Typography;
const { TextArea } = Input;

const CrearProducto: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [atributosCategoria, setAtributosCategoria] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [familyName, setFamilyName] = useState<string>("");
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogProductId, setCatalogProductId] = useState<string>("");

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  const sanitizeTitle = (title: string) => title.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  const validateTitle = (title: string) => {
    let sanitized = sanitizeTitle(title);
    if (sanitized.length > 60) {
      sanitized = sanitized.slice(0, 60);
      message.warning("El título fue truncado a 60 caracteres.");
    }
    return sanitized;
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔑 Token actual:", token);
  }, []);
  
  const predecirCategoria = async (titulo: string) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/products/${conexion.client_id}/catalogo`,
        {
          params: { title: titulo },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
  
      const data = response.data;
  
      if (!data.category_id) {
        message.error("No se pudo predecir la categoría.");
        return;
      }
  
      setCategoryId(data.category_id);
      setFamilyName(data.family_name);
      form.setFieldsValue({ category_id: data.category_id });
  
      const atributosRes = await axios.get(
        `https://api.mercadolibre.com/categories/${data.category_id}/attributes`
      );
      setAtributosCategoria(atributosRes.data);
  
      if (data.products && data.products.length > 0) {
        setCatalogProducts(data.products);
        message.warning("⚠️ Esta categoría tiene catálogo disponible.");
      } else {
        setCatalogProducts([]);
        message.success("✅ Categoría detectada sin catálogo obligatorio.");
      }
    } catch (error: any) {
      console.error("❌ Error al predecir la categoría:", error);
      if (error.response?.status === 422) {
        message.error("El backend requiere el parámetro title.");
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Error al predecir la categoría.");
      }
    }
  };
  
  

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (titulo.length > 4) predecirCategoria(titulo);
    }, 500);
  };

  const onFinish = async (values: any) => {
    if (!conexion?.client_id) return message.error("No se ha seleccionado una tienda.");
    const titulo = validateTitle(values.title);
  
    const tieneCatalogo = !!catalogProductId?.length;
  
    let payload: any = {
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
      ...(familyName ? { family_name: familyName } : {}),
    };
  
    if (!tieneCatalogo) {
      payload.title = titulo;
      payload.attributes = Object.entries(values.attributes || {}).map(([id, value_name]) => ({
        id,
        value_name,
      }));
    }
  
    if (tieneCatalogo) {
      payload.catalog_product_id = catalogProductId;
    }
  
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
      setCatalogProducts([]);
      setCatalogProductId("");
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
      {conexion?.nickname && (
        <p style={{ fontWeight: 500, marginBottom: 10 }}>
          🛒 Estás subiendo un producto a: <strong>{conexion.nickname}</strong>
        </p>
      )}
      <Title level={3}>Subir Producto a Mercado Libre</Title>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="title" label="Título" rules={[{ required: !catalogProductId }]}>
          <Input onChange={onTitleChange} disabled={!!catalogProductId} />
        </Form.Item>
        <Form.Item name="category_id" label="Categoría (ID)">
          <Input disabled />
        </Form.Item>

        {catalogProducts.length > 0 && (
          <>
            <Form.Item
              name="catalog_product_id"
              label="Producto del catálogo"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                onChange={setCatalogProductId}
                optionFilterProp="children"
                placeholder="Selecciona el producto del catálogo"
              >
                {catalogProducts.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {catalogProductId && (() => {
              const selected = catalogProducts.find((p) => p.id === catalogProductId);
              return selected ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <img
                    src={selected.thumbnail || selected.pictures?.[0]?.url}
                    alt="Producto"
                    width={60}
                    style={{ borderRadius: 4 }}
                  />
                  <div>
                    <strong>{selected.name}</strong>
                  </div>
                </div>
              ) : null;
            })()}
          </>
        )}

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

        {!catalogProductId && (
          <Form.Item name="description" label="Descripción" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
        )}

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

        {!catalogProductId &&
          atributosCategoria
            .filter((attr) => attr.tags?.required || attr.tags?.catalog_required)
            .map((attr) => {
              const esLista = attr.value_type === "list" && attr.values?.length > 0;
              return (
                <Form.Item
                  key={attr.id}
                  name={["attributes", attr.id]}
                  label={attr.name}
                  rules={[{ required: true }]}
                >
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
          <Button type="primary" htmlType="submit" loading={loading} disabled={!categoryId}>
            Subir producto
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CrearProducto;
