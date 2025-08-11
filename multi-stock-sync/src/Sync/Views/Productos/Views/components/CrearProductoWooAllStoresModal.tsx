import React from "react";
import {
  Modal, Form, Input, InputNumber, Switch, Row, Col, message,
  Card, Typography, Image as AntImage
} from "antd";
import {
  ShopOutlined,
  DollarOutlined,
  TagOutlined,
  FileTextOutlined,
  PictureOutlined,
  InboxOutlined,
  StarOutlined
} from "@ant-design/icons";

const { Text } = Typography;

export interface CrearProductoWooAllStoresModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
}

const CrearProductoWooAllStoresModal: React.FC<CrearProductoWooAllStoresModalProps> = ({
  visible,
  loading = false,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleOk = () => {
    form.submit();
  };

  // Helpers para formatter/parser
  const moneyFormatter = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "";
    const [int, dec] = String(value).split(".");
    const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$ ${withSep}${dec !== undefined ? "." + dec : ""}`;
  };

  const moneyParser = (displayValue: string | undefined): number => {
    const s = (displayValue ?? "").replace(/[^\d.-]/g, "");
    return s ? Number(s) : 0;
  };

  const intParser = (displayValue: string | undefined): number => {
    const s = (displayValue ?? "").replace(/[^\d-]/g, "");
    return s ? Number(s) : 0;
  };

  // --------- Preview de imagen ----------
  const imageUrl: string | undefined = Form.useWatch("image_url", form);
  const [imgStatus, setImgStatus] = React.useState<"idle" | "loading" | "ok" | "error">("idle");

  React.useEffect(() => {
    if (!imageUrl) {
      setImgStatus("idle");
      return;
    }
    setImgStatus("loading");
    const probe = new window.Image();
    probe.src = imageUrl;
    probe.onload = () => setImgStatus("ok");
    probe.onerror = () => setImgStatus("error");
    return () => {
    
      probe.onload = null;
      probe.onerror = null;
    };
  }, [imageUrl]);
  // --------------------------------------

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "#e74c3c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShopOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#2c3e50", lineHeight: 1.2 }}>
              Crear Producto WooCommerce
            </div>
            <Text style={{ fontSize: 13, color: "#7f8c8d" }}>Se creará en todas las tiendas conectadas</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Crear Producto"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
      width={600}
      okButtonProps={{
        htmlType: "submit",
        form: "wooAllStoresForm",
        style: {
          backgroundColor: "#e74c3c",
          borderColor: "#e74c3c",
          borderRadius: 6,
          height: 36,
          fontWeight: 500,
        },
      }}
      cancelButtonProps={{ style: { borderRadius: 6, height: 36 } }}
      styles={{
        header: { borderBottom: "1px solid #f0f0f0", paddingBottom: 16 },
        body: { paddingTop: 20 },
      }}
    >
      <Form
        id="wooAllStoresForm"
        layout="vertical"
        form={form}
        initialValues={{ featured: false, manage_stock: true, stock_quantity: 0 }}
        onFinish={(values) => {
          const payload = {
            name: values.name,
            regular_price: values.regular_price?.toString(),
            description: values.description || "",
            short_description: values.short_description || "",
            sku: values.sku,
            featured: !!values.featured,
            manage_stock: !!values.manage_stock,
            stock_quantity: values.manage_stock ? Number(values.stock_quantity ?? 0) : undefined,
            images: values.image_url ? [{ src: values.image_url }] : [],
          };

          if (!payload.name?.trim()) return message.error("El nombre es obligatorio");
          if (!payload.sku?.trim()) return message.error("El SKU es obligatorio");
          if (!payload.regular_price) return message.error("El precio regular es obligatorio");

          onSave(payload);
        }}
        onFinishFailed={() => message.error("Revisa los campos requeridos.")}
      >
        {/* Información Básica */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TagOutlined style={{ color: "#3498db" }} />
              <span style={{ color: "#2c3e50", fontSize: 14, fontWeight: 600 }}>Información Básica</span>
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #e8f4f8" }}
          headStyle={{ backgroundColor: "#f8fbfc", borderBottom: "1px solid #e8f4f8", borderRadius: "8px 8px 0 0", minHeight: "auto", padding: "12px 16px" }}
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Nombre del Producto</span>}
                name="name"
                rules={[{ required: true, message: "Ingresa el nombre del producto" }]}
              >
                <Input placeholder="Ej: Polera básica unisex" style={{ borderRadius: 6, height: 40 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#2c3e50" }}>
                    <DollarOutlined style={{ marginRight: 4, color: "#27ae60" }} />
                    Precio Regular
                  </span>
                }
                name="regular_price"
                rules={[{ required: true, message: "Ingresa el precio regular" }]}
              >
                <InputNumber<number>
                  min={0}
                  style={{ width: "100%", borderRadius: 6, height: 40 }}
                  placeholder="14990"
                  formatter={moneyFormatter}
                  parser={moneyParser}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>SKU</span>}
                name="sku"
                rules={[{ required: true, message: "Ingresa el SKU" }]}
              >
                <Input placeholder="SKU-0001" style={{ borderRadius: 6, height: 40 }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Descripción */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ color: "#9b59b6" }} />
              <span style={{ color: "#2c3e50", fontSize: 14, fontWeight: 600 }}>Descripción</span>
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #f4ecf7" }}
          headStyle={{ backgroundColor: "#faf8fc", borderBottom: "1px solid #f4ecf7", borderRadius: "8px 8px 0 0", minHeight: "auto", padding: "12px 16px" }}
          bodyStyle={{ padding: 16 }}
        >
          <Form.Item label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Descripción Corta</span>} name="short_description">
            <Input.TextArea rows={2} placeholder="Resumen del producto..." style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Descripción Detallada</span>} name="description">
            <Input.TextArea rows={3} placeholder="Descripción completa del producto..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Card>

        {/* Imagen y Stock */}
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PictureOutlined style={{ color: "#f39c12" }} />
                  <span style={{ color: "#2c3e50", fontSize: 14, fontWeight: 600 }}>Imagen</span>
                </div>
              }
              style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #fef9e7" }}
              headStyle={{ backgroundColor: "#fffcf5", borderBottom: "1px solid #fef9e7", borderRadius: "8px 8px 0 0", minHeight: "auto", padding: "12px 16px" }}
              bodyStyle={{ padding: 16 }}
            >
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>URL de Imagen</span>}
                name="image_url"
                tooltip="Pega una URL pública directa a la imagen (https://...)"
              >
                <Input placeholder="https://..." style={{ borderRadius: 6, height: 40 }} />
              </Form.Item>

              {/* Preview */}
              <div
                style={{
                  border: "1px dashed #f0d9a7",
                  borderRadius: 8,
                  padding: 8,
                  background: "#fffdf7",
                }}
              >
                {imgStatus === "idle" && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ingresa una URL para previsualizar la imagen aquí.
                  </Text>
                )}
                {imgStatus === "loading" && (
                  <Text style={{ fontSize: 12 }}>Cargando preview…</Text>
                )}
                {imgStatus === "error" && (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    No se pudo cargar la imagen. Verifica la URL o que sea pública.
                  </Text>
                )}
                {imgStatus === "ok" && imageUrl && (
                  <AntImage
                    src={imageUrl}
                    width="100%"
                    style={{ borderRadius: 6, objectFit: "contain", maxHeight: 240 }}
                    // evita modal grande de preview y mantiene dentro del card
                    preview={{ mask: "Ver", zIndex: 2000 }}
                    alt="Preview de imagen"
                  />
                )}
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <InboxOutlined style={{ color: "#17a2b8" }} />
                  <span style={{ color: "#2c3e50", fontSize: 14, fontWeight: 600 }}>Inventario</span>
                </div>
              }
              style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #e1f7fa" }}
              headStyle={{ backgroundColor: "#f0fcfd", borderBottom: "1px solid #e1f7fa", borderRadius: "8px 8px 0 0", minHeight: "auto", padding: "12px 16px" }}
              bodyStyle={{ padding: 16 }}
            >
              <Form.Item
                label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Gestionar Stock</span>}
                name="manage_stock"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Sí"
                  unCheckedChildren="No"
                  style={{ backgroundColor: form.getFieldValue("manage_stock") ? "#27ae60" : undefined }}
                />
              </Form.Item>

              <Form.Item label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Cantidad en Stock</span>} name="stock_quantity">
                <InputNumber<number>
                  min={0}
                  style={{ width: "100%", borderRadius: 6, height: 40 }}
                  placeholder="0"
                  formatter={(v: number | string | null | undefined) => {
                    if (v === null || v === undefined) return "";
                    const s = typeof v === "number" ? String(v) : v;
                    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }}
                  parser={(displayValue?: string) => {
                    const s = (displayValue ?? "").replace(/[^\d-]/g, "");
                    return s ? Number(s) : 0;
                  }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Configuración Adicional */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarOutlined style={{ color: "#e74c3c" }} />
              <span style={{ color: "#2c3e50", fontSize: 14, fontWeight: 600 }}>Configuración Adicional</span>
            </div>
          }
          style={{ borderRadius: 8, border: "1px solid #ffeaea" }}
          headStyle={{ backgroundColor: "#fff5f5", borderBottom: "1px solid #ffeaea", borderRadius: "8px 8px 0 0", minHeight: "auto", padding: "12px 16px" }}
          bodyStyle={{ padding: 16 }}
        >
          <Form.Item label={<span style={{ fontWeight: 500, color: "#2c3e50" }}>Producto Destacado</span>} name="featured" valuePropName="checked">
            <Switch checkedChildren="Sí" unCheckedChildren="No" style={{ backgroundColor: form.getFieldValue("featured") ? "#e74c3c" : undefined }} />
          </Form.Item>
          <Text style={{ fontSize: 12, color: "#7f8c8d", display: "block", marginTop: -8 }}>
            Los productos destacados aparecen en secciones especiales de la tienda
          </Text>
        </Card>
      </Form>
    </Modal>
  );
};

export default CrearProductoWooAllStoresModal;
