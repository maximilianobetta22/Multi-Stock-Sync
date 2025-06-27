import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Alert,
  Space,
  Button,
  Upload,
  message,
  Divider,
  Tag,
  Image,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined, LinkOutlined, ShopOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  loading: boolean;
}

const CrearProductoWooModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  loading,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // Obtener Store ID mapeado
  const getStoreId = () => {
    const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
    // Mapeo simple basado en el servicio existente
    const STORE_MAPPING: Record<string, number> = {
      OFERTASIMPERDIBLESCHILE: 1,
      ofertasimperdibles: 1,
      LENCERIAONLINE: 2,
      lenceriaonline: 2,
      CRAZYFAMILY: 3,
      crazyfamily: 3,
      COMERCIALIZADORAABIZICL: 4,
      ABIZI: 4,
      abizi: 4,
    };

    return STORE_MAPPING[conexion.nickname?.toLowerCase()] ||
           STORE_MAPPING[conexion.nickname?.toUpperCase()] ||
           STORE_MAPPING[conexion.client_id] ||
           1; // Default fallback
  };

  // Cargar categorías cuando se abre el modal
  const loadCategories = async () => {
    const storeId = getStoreId();
    setLoadingCategories(true);
    
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/woocommerce/woo/${storeId}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
          params: {
            per_page: 100, // Obtener todas las categorías
            orderby: 'name',
            order: 'asc',
          }
        }
      );

      console.log("📦 Categorías cargadas:", response.data);
      
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error: any) {
      console.error("❌ Error al cargar categorías:", error);
      message.error("Error al cargar las categorías de WooCommerce");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Cargar categorías cuando se abre el modal
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  // Agregar imagen por URL
  const handleAddImageUrl = () => {
    const url = prompt("Ingresa la URL de la imagen:");
    if (url && url.trim()) {
      // Validar que sea una URL válida
      try {
        new URL(url);
        setImages(prev => [...prev, url.trim()]);
        message.success("Imagen agregada correctamente");
      } catch {
        message.error("URL de imagen no válida");
      }
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Validaciones básicas
      if (!values.name || values.name.trim() === '') {
        message.error('El nombre del producto es obligatorio');
        return;
      }

      if (!values.sku || values.sku.trim() === '') {
        message.error('El SKU del producto es obligatorio');
        return;
      }

      if (!values.regular_price || values.regular_price <= 0) {
        message.error('El precio del producto debe ser mayor a 0');
        return;
      }

      // Función helper para convertir a número o null
      const toNumberOrNull = (value: any) => {
        if (value === null || value === undefined || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      // Función helper para convertir a string o null
      const toStringOrNull = (value: any) => {
        if (value === null || value === undefined || value === '') return null;
        return value.toString();
      };
      
      // Preparar imágenes para WooCommerce
      const productImages = images.map((url, index) => ({
        src: url,
        alt: `${values.name} - Imagen ${index + 1}`,
        position: index
      }));

      // Preparar categorías seleccionadas
      const selectedCategories = values.categories ? 
        values.categories.map((catId: number) => ({ id: catId })) : [];
      
      // Limpiar y estructurar los datos según lo que espera WooCommerce/Laravel
      const productData = {
        name: values.name.trim(),
        type: values.type || "simple",
        regular_price: toNumberOrNull(values.regular_price),
        sale_price: toNumberOrNull(values.sale_price),
        description: values.description?.trim() || "",
        short_description: values.short_description?.trim() || "",
        sku: values.sku.trim(),
        manage_stock: Boolean(values.manage_stock),
        stock_quantity: values.manage_stock ? (values.stock_quantity || 0) : null,
        stock_status: values.stock_status || "instock",
        weight: toStringOrNull(values.weight),
        dimensions: {
          length: toStringOrNull(values.dimensions?.length),
          width: toStringOrNull(values.dimensions?.width),
          height: toStringOrNull(values.dimensions?.height),
        },
        status: values.status || "publish",
        featured: Boolean(values.featured),
        catalog_visibility: values.catalog_visibility || "visible",
        virtual: Boolean(values.virtual),
        downloadable: Boolean(values.downloadable),
        reviews_allowed: Boolean(values.reviews_allowed !== false),
        tax_status: values.tax_status || "taxable",
        categories: selectedCategories,
        tags: [],
        images: productImages,
      };

      console.log("📋 Datos a enviar:", productData);
      
      await onSave(productData);
      
      // Limpiar formulario y cerrar modal
      form.resetFields();
      setImages([]);
      
    } catch (error) {
      console.error("❌ Error al validar formulario:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImages([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 0"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#FF6B35",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "18px"
          }}>
            <ShopOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
              Crear Nuevo Producto WooCommerce
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Completa la información del producto para WooCommerce
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={1200}
      style={{ top: 20 }}
      okText="Crear Producto"
      cancelText="Cancelar"
      destroyOnClose={true}
      okButtonProps={{
        style: {
          backgroundColor: "#FF6B35",
          borderColor: "#FF6B35",
          borderRadius: "8px",
          fontWeight: "600",
          height: "40px",
          paddingLeft: "24px",
          paddingRight: "24px"
        }
      }}
      cancelButtonProps={{
        style: {
          borderRadius: "8px",
          height: "40px",
          paddingLeft: "24px",
          paddingRight: "24px"
        }
      }}
    >
      {/* Alert con mejor diseño */}
      <div style={{
        backgroundColor: "#e6f4ff",
        border: "1px solid #91caff",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <InfoCircleOutlined style={{ fontSize: "18px", color: "#1677ff" }} />
        <div>
          <Text strong style={{ color: "#1677ff", fontSize: "14px" }}>
            Información importante
          </Text>
          <br />
          <Text style={{ color: "#1677ff", fontSize: "13px" }}>
            Completa todos los campos obligatorios marcados con *. Las imágenes se pueden agregar por URL.
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: "simple",
          status: "publish",
          stock_status: "instock",
          catalog_visibility: "visible",
          tax_status: "taxable",
          manage_stock: true,
          featured: false,
          virtual: false,
          downloadable: false,
          reviews_allowed: true,
          stock_quantity: 1,
          regular_price: 0,
        }}
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          paddingRight: "8px"
        }}
      >
        {/* Información básica */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              📝 Información Básica
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={
                  <Text strong>
                    Nombre del Producto <span style={{ color: "#ff4d4f" }}>*</span>
                  </Text>
                }
                rules={[
                  { required: true, message: "El nombre es obligatorio" },
                  { min: 3, message: "El nombre debe tener al menos 3 caracteres" }
                ]}
              >
                <Input 
                  placeholder="Ej: Camiseta de algodón azul" 
                  size="large"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="type" 
                label={<Text strong>Tipo de Producto</Text>}
              >
                <Select size="large" style={{ borderRadius: "8px" }}>
                  <Option value="simple">Simple</Option>
                  <Option value="grouped">Agrupado</Option>
                  <Option value="external">Externo</Option>
                  <Option value="variable">Variable</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="sku" 
                label={
                  <Text strong>
                    SKU <span style={{ color: "#ff4d4f" }}>*</span>
                  </Text>
                }
                rules={[
                  { required: true, message: "El SKU es obligatorio" },
                  { min: 3, message: "El SKU debe tener al menos 3 caracteres" }
                ]}
              >
                <Input 
                  placeholder="Código único del producto (ej: CAM-001)" 
                  size="large"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="short_description" 
                label={<Text strong>Descripción Corta</Text>}
              >
                <TextArea
                  rows={2}
                  placeholder="Descripción breve que aparece en el listado"
                  maxLength={160}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="description" 
                label={<Text strong>Descripción Completa</Text>}
              >
                <TextArea
                  rows={4}
                  placeholder="Descripción detallada del producto"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Precios */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              💰 Precios
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="regular_price"
                label={
                  <Text strong>
                    Precio Regular <span style={{ color: "#ff4d4f" }}>*</span>
                  </Text>
                }
                rules={[
                  { required: true, message: "El precio es obligatorio" },
                  { type: 'number', min: 0, message: "El precio debe ser mayor a 0" }
                ]}
              >
                <InputNumber
                  min={0}
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="Ej: 19990"
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="sale_price" 
                label={<Text strong>Precio de Oferta</Text>}
              >
                <InputNumber
                  min={0}
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="Ej: 15990"
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Categorías */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              🏷️ Categorización
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="categories" 
                label={<Text strong>Categorías</Text>}
              >
                <Select
                  mode="multiple"
                  placeholder="Selecciona las categorías del producto"
                  loading={loadingCategories}
                  showSearch
                  size="large"
                  style={{ borderRadius: "8px" }}
                  optionFilterProp="children"
                  notFoundContent={loadingCategories ? "Cargando..." : "No hay categorías"}
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name} {category.count > 0 && `(${category.count} productos)`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Imágenes */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              🖼️ Imágenes del Producto
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button 
                  type="dashed" 
                  icon={<LinkOutlined />} 
                  onClick={handleAddImageUrl}
                  size="large"
                  style={{ 
                    width: "100%",
                    borderRadius: "8px",
                    borderStyle: "dashed",
                    borderColor: "#FF6B35",
                    color: "#FF6B35",
                    height: "48px"
                  }}
                >
                  Agregar imagen por URL
                </Button>
                
                {images.length > 0 && (
                  <div>
                    <Divider orientation="left">
                      <Text strong style={{ color: "#FF6B35" }}>
                        Imágenes agregadas ({images.length})
                      </Text>
                    </Divider>
                    <Row gutter={[12, 12]}>
                      {images.map((imageUrl, index) => (
                        <Col key={index} span={6}>
                          <Card
                            size="small"
                            cover={
                              <Image
                                src={imageUrl}
                                alt={`Producto imagen ${index + 1}`}
                                style={{ 
                                  height: 120, 
                                  objectFit: "cover",
                                  borderRadius: "8px 8px 0 0"
                                }}
                                fallback="/placeholder.svg"
                              />
                            }
                            actions={[
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveImage(index)}
                                style={{ borderRadius: "6px" }}
                              >
                                Eliminar
                              </Button>
                            ]}
                            style={{ 
                              borderRadius: "8px",
                              border: "1px solid #e8ecf0" 
                            }}
                          >
                            <Card.Meta
                              description={
                                <Tag color="blue" style={{ borderRadius: "6px" }}>
                                  Imagen {index + 1}
                                </Tag>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Inventario */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              📦 Inventario
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="manage_stock" valuePropName="checked">
                <Switch 
                  checkedChildren="Gestionar stock" 
                  unCheckedChildren="No gestionar stock"
                  style={{
                    backgroundColor: "#FF6B35"
                  }}
                  onChange={(checked) => {
                    if (!checked) {
                      form.setFieldsValue({ stock_quantity: null });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="stock_quantity" 
                label={<Text strong>Cantidad en Stock</Text>}
                dependencies={['manage_stock']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('manage_stock') && (!value || value <= 0)) {
                        return Promise.reject(new Error('La cantidad debe ser mayor a 0 si gestionas stock'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber 
                  min={0} 
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  disabled={!Form.useWatch('manage_stock', form)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="stock_status" 
                label={<Text strong>Estado del Stock</Text>}
              >
                <Select size="large" style={{ borderRadius: "8px" }}>
                  <Option value="instock">En Stock</Option>
                  <Option value="outofstock">Sin Stock</Option>
                  <Option value="onbackorder">En Espera</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Dimensiones y peso */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              📏 Envío
            </Text>
          }
          size="small" 
          style={{ 
            marginBottom: 20,
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item 
                name="weight" 
                label={<Text strong>Peso (kg)</Text>}
              >
                <InputNumber 
                  min={0} 
                  step={0.1} 
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="0.5"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name={["dimensions", "length"]} 
                label={<Text strong>Largo (cm)</Text>}
              >
                <InputNumber 
                  min={0} 
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="20"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name={["dimensions", "width"]} 
                label={<Text strong>Ancho (cm)</Text>}
              >
                <InputNumber 
                  min={0} 
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="15"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name={["dimensions", "height"]} 
                label={<Text strong>Alto (cm)</Text>}
              >
                <InputNumber 
                  min={0} 
                  size="large"
                  style={{ width: "100%", borderRadius: "8px" }}
                  placeholder="10"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Configuración */}
        <Card 
          title={
            <Text strong style={{ fontSize: "16px", color: "#262626" }}>
              ⚙️ Configuración
            </Text>
          }
          size="small"
          style={{ 
            borderRadius: "12px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
          headStyle={{
            backgroundColor: "#fafafa",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="status" 
                label={<Text strong>Estado</Text>}
              >
                <Select size="large" style={{ borderRadius: "8px" }}>
                  <Option value="publish">Publicado</Option>
                  <Option value="draft">Borrador</Option>
                  <Option value="pending">Pendiente</Option>
                  <Option value="private">Privado</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="catalog_visibility" 
                label={<Text strong>Visibilidad</Text>}
              >
                <Select size="large" style={{ borderRadius: "8px" }}>
                  <Option value="visible">Visible</Option>
                  <Option value="catalog">Solo Catálogo</Option>
                  <Option value="search">Solo Búsqueda</Option>
                  <Option value="hidden">Oculto</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="tax_status" 
                label={<Text strong>Estado de Impuestos</Text>}
              >
                <Select size="large" style={{ borderRadius: "8px" }}>
                  <Option value="taxable">Gravable</Option>
                  <Option value="shipping">Solo Envío</Option>
                  <Option value="none">Ninguno</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="featured" valuePropName="checked">
                <Switch 
                  checkedChildren="Destacado" 
                  unCheckedChildren="Normal"
                  style={{ backgroundColor: "#FF6B35" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="virtual" valuePropName="checked">
                <Switch 
                  checkedChildren="Virtual" 
                  unCheckedChildren="Físico"
                  style={{ backgroundColor: "#FF6B35" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="reviews_allowed" valuePropName="checked">
                <Switch 
                  checkedChildren="Permitir reseñas" 
                  unCheckedChildren="Sin reseñas"
                  style={{ backgroundColor: "#FF6B35" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default CrearProductoWooModal;