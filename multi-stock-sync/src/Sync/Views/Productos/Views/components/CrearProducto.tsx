import React from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Typography,
  Space,
  Card,
  Switch,
  Divider,
  Alert,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCrearProducto } from "../hook/useCrearProducto";

const { Title } = Typography;
const { TextArea } = Input;

const CrearProducto: React.FC = () => {
  const [form] = Form.useForm();

  const {
    loading,
    imagenes,
    atributosCategoria,
    specsDominio,
    categoryId,
    catalogProducts,
    catalogProductId,
    condicionesCategoria,
    categoriasConCatalogoObligatorio,
    setCatalogProductId,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  } = useCrearProducto(form);

  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
  if (!conexion?.nickname) {
    return (
      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        <Alert message="Por favor, selecciona una conexión de Mercado Libre." type="error" />
      </Card>
    );
  }

  const requiereCatalogo = categoriasConCatalogoObligatorio.includes(categoryId);

  return (
    <Card style={{ maxWidth: 900, margin: "0 auto" }}>
      <p style={{ fontWeight: 500, marginBottom: 10 }}>
        🛒 Estás subiendo un producto a: <strong>{conexion.nickname}</strong>
      </p>

      <Title level={3}>Subir Producto a Mercado Libre</Title>

      {!categoryId && (
        <Alert
          type="info"
          message="Escribe un título para predecir la categoría automáticamente."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {requiereCatalogo && !catalogProductId && (
        <Alert
          message="⚠️ Esta categoría exige seleccionar un producto del catálogo para poder publicarlo."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
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
            rules={[{ required: true, message: "Selecciona un producto del catálogo" }]}
          >
            <Select
              showSearch
              onChange={setCatalogProductId}
              optionFilterProp="children"
              placeholder="Selecciona el producto del catálogo"
            >
              {catalogProducts.map((p: any) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="condition" label="Condición" rules={[{ required: true }]}>
          <Select placeholder="Selecciona una condición">
            {condicionesCategoria.map((c: string) => (
              <Select.Option key={c} value={c}>
                {c}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {specsDominio.map((attr: any) => (
          <Form.Item
            key={attr.id}
            name={["specs", attr.id]}
            label={attr.name}
            rules={attr.tags?.required ? [{ required: true }] : []}
          >
            {attr.value_type === "list" && attr.values?.length ? (
              <Select showSearch optionFilterProp="children">
                {attr.values.map((v: any) => (
                  <Select.Option key={v.id} value={v.name}>
                    {v.name}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input placeholder={`Ingrese ${attr.name.toLowerCase()}`} />
            )}
          </Form.Item>
        ))}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="price" label="Precio" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="currency_id" label="Moneda" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="CLP">CLP</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="quantity" label="Cantidad" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        {atributosCategoria.map((atributo) => {
          if (atributo.id === "SIZE_GRID_ID") {
            return (
              <Form.Item
                key={atributo.id}
                label="Guía de Tallas"
                name="size_grid_id"
                rules={[{ required: true, message: "Selecciona una guía de tallas" }]}
              >
                <Select placeholder="Selecciona una guía de tallas">
                  {atributo.values?.map((value: any) => (
                    <Select.Option key={value.id} value={value.id}>
                      {value.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
          return null;
        })}

        {!catalogProductId && (
          <Form.Item
            name="family_name"
            label="Nombre de Familia"
            tooltip="Agrupa publicaciones similares. Ej: modelo, color, tipo, etc."
            rules={[{ required: true }]}
          >
            <Input placeholder="Ej: Celular Samsung A12 Azul" />
          </Form.Item>
        )}

        <Form.Item name="listing_type_id" label="Tipo de publicación" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="gold_special">Clásica</Select.Option>
            <Select.Option value="gold_pro">Premium</Select.Option>
          </Select>
        </Form.Item>

        {!catalogProductId && (
          <Form.Item name="description" label="Descripción" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe tu producto..." />
          </Form.Item>
        )}

        <Form.Item label="Imágenes agregadas">
          <ul>
            {imagenes.map((src, idx) => (
              <li key={idx}>
                <a href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={`Imagen ${idx + 1}`} style={{ maxWidth: 100 }} />
                </a>
              </li>
            ))}
          </ul>
          <Button icon={<UploadOutlined />} onClick={handleAgregarImagen}>
            Agregar imagen por URL
          </Button>
        </Form.Item>

        <Divider />

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
            .filter((attr: any) => attr.tags?.required || attr.tags?.catalog_required)
            .map((attr: any) => (
              <Form.Item
                key={attr.id}
                name={["attributes", attr.id]}
                label={attr.name}
                rules={[{ required: true }]}
              >
                {attr.value_type === "list" && attr.values?.length > 0 ? (
                  <Select
                    mode={attr.tags?.multivalued ? "multiple" : undefined}
                    showSearch
                    optionFilterProp="children"
                  >
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
            ))}

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
