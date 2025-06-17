import React from "react"
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
  Checkbox,
  Tooltip,
} from "antd"
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, UploadOutlined } from "@ant-design/icons"
import { useCrearProducto } from "../hook/useCrearProducto"

const { Title } = Typography
const { TextArea } = Input

const CrearProducto: React.FC = () => {
  const [form] = Form.useForm()

  const {
    loading,
    imagenes,
    atributosCategoria,
    specsDominio,
    categoryId,
    catalogProducts,
    catalogProductId,
    condicionesCategoria,
    tieneVariaciones,
    variaciones,
    guiasTallas,
    tallasDisponibles,
    loadingGuiasTallas,
    marcaSeleccionada,
    generoSeleccionado,
    dominioId,
    setCatalogProductId,
    setTieneVariaciones,
    agregarVariacion,
    eliminarVariacion,
    actualizarVariacion,
    onAtributoChange,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  } = useCrearProducto(form)

  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")
  if (!conexion?.nickname) {
    return (
      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        <Alert message="Por favor, selecciona una conexión de Mercado Libre." type="error" />
      </Card>
    )
  }

  const colorAttr = Array.isArray(atributosCategoria)
    ? atributosCategoria.find((a) => a.id === "COLOR")
    : undefined
  const sizeAttr = Array.isArray(atributosCategoria)
    ? atributosCategoria.find((a) => a.id === "SIZE")
    : undefined

  return (
    <Card style={{ maxWidth: 900, margin: "0 auto" }}>
      <Title level={3}>Subir Producto a Mercado Libre</Title>

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

        {/* OCULTA TALLA GENERAL SI HAY VARIACIONES */}
        {!catalogProductId &&
          Array.isArray(atributosCategoria) &&
          atributosCategoria
            .filter(
              (attr: any) =>
                (attr.tags?.required || attr.tags?.catalog_required) &&
                !(tieneVariaciones && attr.id === "SIZE")
            )
            .map((attr: any) => (
              <Form.Item
                key={attr.id}
                name={["attributes", attr.id]}
                label={
                  <Space>
                    {attr.name}
                    {attr.tooltip && (
                      <Tooltip title={attr.tooltip}>
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Tooltip>
                    )}
                  </Space>
                }
                rules={[{ required: true }]}
              >
                {attr.value_type === "list" && attr.values?.length > 0 ? (
                  <Select
                    mode={attr.tags?.multivalued ? "multiple" : undefined}
                    showSearch
                    optionFilterProp="children"
                    onChange={(value) => onAtributoChange(attr.id, value)}
                    placeholder={attr.hint || `Selecciona ${attr.name.toLowerCase()}`}
                  >
                    {attr.values.map((v: any) => (
                      <Select.Option key={v.id} value={v.name}>
                        {v.name}
                      </Select.Option>
                    ))}
                  </Select>
                ) : attr.value_type === "number" ? (
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={attr.hint || `Ingrese ${attr.name.toLowerCase()}`}
                    min={0}
                  />
                ) : attr.value_type === "boolean" ? (
                  <Switch />
                ) : (
                  <Input
                    placeholder={attr.hint || `Ingrese ${attr.name.toLowerCase()}`}
                    maxLength={attr.value_max_length}
                  />
                )}
              </Form.Item>
            ))}

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
                  <img src={src || "/placeholder.svg"} alt={`Imagen ${idx + 1}`} style={{ maxWidth: 100 }} />
                </a>
              </li>
            ))}
          </ul>
          <Button icon={<UploadOutlined />} onClick={handleAgregarImagen}>
            Agregar imagen por URL
          </Button>
        </Form.Item>

        <Divider />

        {/* Sección de Variaciones */}
        <Card title="Variaciones del Producto" size="small" style={{ marginBottom: 16 }}>
          <Form.Item label="¿Este producto tiene variaciones?" style={{ marginBottom: 16 }}>
            <Checkbox checked={tieneVariaciones} onChange={(e) => setTieneVariaciones(e.target.checked)}>
              Sí, este producto tiene variaciones (colores, tallas, diseños, etc.)
            </Checkbox>
          </Form.Item>

          {tieneVariaciones && (
            <div>
              {/* Información de guías de tallas */}
              {marcaSeleccionada && generoSeleccionado && (
                <Alert
                  message="Guías de Tallas"
                  description={
                    loadingGuiasTallas ? (
                      "Cargando guías de tallas..."
                    ) : guiasTallas.length > 0 ? (
                      <div>
                        <p>Se encontraron {guiasTallas.length} guías de tallas disponibles.</p>
                        <p>Tallas disponibles: {tallasDisponibles.map((t: any) => t.name).join(", ")}</p>
                        <p>Dominio: {dominioId}</p>
                      </div>
                    ) : (
                      "No se encontraron guías de tallas para esta combinación."
                    )
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Lista de variaciones */}
              {variaciones.map((variacion: any, index: number) => (
                <Card
                  key={variacion.id}
                  size="small"
                  title={`Variación ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => eliminarVariacion(variacion.id)}
                    >
                      Eliminar
                    </Button>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item label="Color">
                        <Select
                          value={variacion.color}
                          onChange={(value) => actualizarVariacion(variacion.id, "color", value)}
                          placeholder="Selecciona color"
                          allowClear
                        >
                          {colorAttr?.values?.map((color: any) => (
                            <Select.Option key={color.id} value={color.name}>
                              {color.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Talla">
                        <Select
                          value={variacion.size}
                          onChange={(value) => actualizarVariacion(variacion.id, "size", value)}
                          placeholder="Selecciona talla"
                          allowClear
                        >
                          {tallasDisponibles.length > 0
                            ? tallasDisponibles.map((talla: any) => (
                                <Select.Option key={talla.id} value={talla.name}>
                                  {talla.name}
                                </Select.Option>
                              ))
                            : sizeAttr?.values?.map((talla: any) => (
                                <Select.Option key={talla.id} value={talla.name}>
                                  {talla.name}
                                </Select.Option>
                              ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Precio" rules={[{ required: true }]}>
                        <InputNumber
                          value={variacion.price}
                          onChange={(value) => actualizarVariacion(variacion.id, "price", value || 0)}
                          min={0}
                          style={{ width: "100%" }}
                          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Stock" rules={[{ required: true }]}>
                        <InputNumber
                          value={variacion.available_quantity}
                          onChange={(value) => actualizarVariacion(variacion.id, "available_quantity", value || 1)}
                          min={1}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={agregarVariacion}
                icon={<PlusOutlined />}
                style={{ width: "100%", marginBottom: 16 }}
              >
                Agregar Variación
              </Button>
            </div>
          )}
        </Card>

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
  )
}

export default CrearProducto