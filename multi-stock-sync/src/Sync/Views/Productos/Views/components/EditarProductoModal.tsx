import React, { useEffect } from "react"
import { Modal, Form, Input, InputNumber, Select, Space } from "antd"
import type { WooCommerceProduct } from "../Types/woocommerceTypes"

const { Option } = Select

interface Props {
  visible: boolean
  product: WooCommerceProduct | null
  onClose: () => void
  onSave: (values: any) => void
}

const EditarProductoModal: React.FC<Props> = ({ visible, product, onClose, onSave }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        regular_price: parseFloat(product.regular_price || "0"),
        stock_quantity: product.stock_quantity,
        weight: product.weight || "",
        dimensions: {
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
        },
        status: product.status || "publish",
      })
    }
  }, [product, form])

  const handleOk = () => {
  form.validateFields().then((values) => {
    // Sanitizar datos
    const cleanedData = {
      name: values.name,
      regular_price: values.regular_price?.toString(), // WooCommerce espera string
      stock_quantity: values.stock_quantity,
      weight: values.weight?.trim() || undefined,
      dimensions: {
        length: values.dimensions?.length?.trim() || undefined,
        width: values.dimensions?.width?.trim() || undefined,
        height: values.dimensions?.height?.trim() || undefined,
      },
      status: values.status,
    }

    onSave(cleanedData)
  })
}


  return (
    <Modal open={visible} onCancel={onClose} onOk={handleOk} title="Editar Producto WooCommerce">
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nombre del Producto" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="regular_price" label="Precio" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="stock_quantity" label="Stock" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
              <Form.Item
                  name="weight"
                  label="Peso"
                  rules={[{ required: false }, { pattern: /^\d*\.?\d+$/, message: "Ingresa un número válido" }]}
              >
                  <Input addonAfter="kg" placeholder="Ej: 1.5" />
              </Form.Item>

             <Form.Item label="Dimensiones">
  <Space.Compact style={{ width: "100%" }}>
    <Form.Item
      name={["dimensions", "length"]}
      noStyle
      rules={[{ pattern: /^\d*\.?\d+$/, message: "Largo inválido" }]}
    >
      <Input placeholder="Largo" />
    </Form.Item>
    <Form.Item
      name={["dimensions", "width"]}
      noStyle
      rules={[{ pattern: /^\d*\.?\d+$/, message: "Ancho inválido" }]}
    >
      <Input placeholder="Ancho" />
    </Form.Item>
    <Form.Item
      name={["dimensions", "height"]}
      noStyle
      rules={[{ pattern: /^\d*\.?\d+$/, message: "Alto inválido" }]}
    >
      <Input placeholder="Alto" />
    </Form.Item>
  </Space.Compact>
</Form.Item>

        <Form.Item name="status" label="Estado" rules={[{ required: true }]}>
          <Select>
            <Option value="publish">Publicado</Option>
            <Option value="draft">Borrador</Option>
            <Option value="pending">Pendiente</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditarProductoModal
