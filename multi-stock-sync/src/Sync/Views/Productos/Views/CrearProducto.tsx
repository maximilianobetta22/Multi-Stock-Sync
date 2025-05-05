import React, { useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  message,
  Card,
  Typography,
  Space,
  Switch,
} from "antd";
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
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogProductId, setCatalogProductId] = useState<string>("");
  const [condicionesCategoria, setCondicionesCategoria] = useState<string[]>([]);
  const [specsDominio, setSpecsDominio] = useState<any[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  const categoriasConCatalogoObligatorio = useRef<string[]>(["MLC31438"]).current;

  const sanitizeTitle = (title: string) => title.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  const validateTitle = (title: string) => {
    let sanitized = sanitizeTitle(title);
    if (sanitized.length > 60) {
      sanitized = sanitized.slice(0, 60);
      message.warning("El título fue truncado a 60 caracteres.");
    }
    return sanitized;
  };

  const obtenerCondicionesYCatalogo = async (category: string, domain: string) => {
    try {
      const { data } = await axios.get(`https://api.mercadolibre.com/categories/${category}`);
      console.log("📦 Categoría recibida:", data);
  
      // Si no trae condiciones, se usa fallback
      if (data.item_conditions?.length) {
        setCondicionesCategoria(data.item_conditions);
      } else {
        setCondicionesCategoria(["new", "used"]);
      }
  
      if (domain) {
        const specs = await axios.get(`https://api.mercadolibre.com/domains/${domain}/technical_specs`);
        if (specs.data?.attributes) setSpecsDominio(specs.data.attributes);
      }
    } catch (error) {
      console.error("🔴 Error obteniendo condiciones o specs de dominio:", error);
    }
  };
  

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
      setFamilyName(data.family_name || data.domain_name || "");
      form.setFieldsValue({ category_id: data.category_id });
      obtenerCondicionesYCatalogo(data.category_id, data.domain_id);

      const atributosRes = await axios.get(
        `https://api.mercadolibre.com/categories/${data.category_id}/attributes`
      );
      setAtributosCategoria(atributosRes.data);

      if (data.products && data.products.length > 0) {
        setCatalogProducts(data.products);
        
        const primerProducto = data.products[0];
        setCatalogProductId(primerProducto.id);
        form.setFieldsValue({ catalog_product_id: primerProducto.id });
      
        // Hacer scroll al campo y notificar
        setTimeout(() => {
          form.scrollToField('catalog_product_id');
          message.info(`Se seleccionó automáticamente el producto del catálogo: ${primerProducto.name}`);
        }, 300);
        
        message.warning("⚠️ Esta categoría tiene catálogo disponible.");
      } else {
        setCatalogProducts([]);
        form.setFieldsValue({ catalog_product_id: undefined });
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

  const handleAgregarImagen = () => {
    const url = prompt("Ingresa el URL de la imagen (MercadoLibre solo acepta links públicos):");
    if (url) {
      setImagenes((prev) => [...prev, url]);
      message.success("✅ Imagen agregada correctamente");
    }
  };

  const onFinish = async (values: any) => {
    if (!conexion?.client_id) return message.error("No se ha seleccionado una tienda.");
    if (!categoryId) return message.error("No se ha detectado una categoría.");
    if (!values.condition) return message.error("No se ha seleccionado una condición.");
    if (imagenes.length === 0) return message.error("Debes agregar al menos una imagen.");
  
    const tieneCatalogo = !!catalogProductId;
    const categoriaConCatalogo = catalogProducts.length > 0;
    const requiereCatalogo =
      categoriaConCatalogo || categoriasConCatalogoObligatorio.includes(categoryId);
  
    if (requiereCatalogo && !catalogProductId) {
      message.error("⚠️ Esta categoría exige subir el producto mediante catálogo.");
      return;
    }
  
    let payload: any;
  
    if (tieneCatalogo) {
      const selectedProduct = catalogProducts.find((p) => p.id === catalogProductId);
      if (!selectedProduct) return message.error("Producto del catálogo no encontrado.");
      setFamilyName(selectedProduct.family_name || selectedProduct.domain_name || "");
  
      payload = {
        catalog_product_id: catalogProductId,
        category_id: categoryId,
        condition: values.condition,
        price: values.price,
        currency_id: values.currency_id,
        available_quantity: values.quantity,
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
  
      // 🔐 Borrar cualquier rastro de título/desc
      delete payload.title;
      delete payload.description;
    } else {
      // 🔐 Borra cualquier rastro anterior del catálogo
      setCatalogProductId(""); // Visual
      form.setFieldsValue({ catalog_product_id: undefined }); // Formulario
  
      const titulo = validateTitle(values.title);
  
      payload = {
        title: titulo,
        description: values.description,
        category_id: categoryId,
        condition: values.condition,
        price: values.price,
        currency_id: values.currency_id,
        available_quantity: values.quantity,
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
        attributes: [
          ...Object.entries(values.attributes || {}).map(([id, value_name]) => ({ id, value_name })),
          ...Object.entries(values.specs || {}).map(([id, value_name]) => ({ id, value_name })),
        ],
      };
    }
  
    console.log("🧾 Payload final:", payload);
    console.log("📦 catalogProductId actual:", catalogProductId);
  
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
  
  

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      {conexion?.nickname && (
        <p style={{ fontWeight: 500, marginBottom: 10 }}>
          🛒 Estás subiendo un producto a: <strong>{conexion.nickname}</strong>
        </p>
      )}

      <Title level={3}>Subir Producto a Mercado Libre</Title>

      {(catalogProducts.length > 0 || categoriasConCatalogoObligatorio.includes(categoryId)) &&
        !catalogProductId && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                backgroundColor: "#fff1f0",
                border: "1px solid #ffa39e",
                padding: 12,
                borderRadius: 4,
                color: "#a8071a",
              }}
            >
              ⚠️ Esta categoría exige seleccionar un producto del catálogo para poder publicarlo.
            </div>
          </div>
        )}

      <Form layout="vertical" form={form} onFinish={onFinish}>
        {!catalogProductId && (
          <Form.Item name="title" label="Título" rules={[{ required: true }]}> 
            <Input onChange={onTitleChange} placeholder="Ej: Polera de algodón" />
          </Form.Item>
        )}

        <Form.Item name="category_id" label="Categoría (ID)">
          <Input disabled value={categoryId} />
        </Form.Item>

        {catalogProducts.length > 0 && (
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
)}


        <Form.Item name="condition" label="Condición" rules={[{ required: true }]}> 
          <Select placeholder="Selecciona una condición">
            {condicionesCategoria.map((c) => (
              <Select.Option key={c} value={c}>{c}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {specsDominio.length > 0 && specsDominio.map((attr: any) => (
          <Form.Item
            key={attr.id}
            name={["specs", attr.id]}
            label={attr.name}
            rules={attr.tags?.required ? [{ required: true }] : []}
          >
            {attr.value_type === "list" && attr.values?.length ? (
              <Select showSearch optionFilterProp="children">
                {attr.values.map((v: any) => (
                  <Select.Option key={v.id} value={v.name}>{v.name}</Select.Option>
                ))}
              </Select>
            ) : (
              <Input placeholder={`Ingrese ${attr.name.toLowerCase()}`} />
            )}
          </Form.Item>
        ))}

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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!categoryId || (catalogProducts.length > 0 && !catalogProductId)}
          >
            Subir producto
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CrearProducto;
