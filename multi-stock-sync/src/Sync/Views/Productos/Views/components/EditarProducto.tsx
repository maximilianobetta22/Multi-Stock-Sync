import { useState } from "react";
import axios from "axios";
import {
  
  InputNumber,
  Modal,
  Form,
  Select,
  Typography,
  message,
  Space,
 
  DatePicker,
  Input,
} from "antd";

import { useEditarProductos } from "../hook/useEditarProducto";
import { TablaProductos } from "./TablaProductos";

const { Title, Text } = Typography;

const { Option } = Select;

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  has_bids?: boolean;
  catalog_listing?: boolean;
  description?: { plain_text: string };
  pictures?: { secure_url: string }[];
  atributes?: any[];
  date_created?: string;
  sold_quantity?: number;
  user_product_id?: string;
}

const EditarProductos = () => {
  const [form] = Form.useForm();
  const [productoEditando, setProductoEditando] = useState<ProductoML | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  

  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  const {
    productos,
    loading,
    pagina,
    setPagina,
    total,
    busqueda,
    setBusqueda,
    busquedaActual,
    setBusquedaActual,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    estadoFiltro,
    setEstadoFiltro,
    fetchProductos,
  } = useEditarProductos(conexion);
  
  const esEditable = (producto: ProductoML) => {
  return !producto.catalog_listing && producto.sold_quantity === 0 && producto.user_product_id;
};


  const handleEditar = (producto: ProductoML) => {
  if (!esEditable(producto)) {
    message.warning("Este producto no permite editar precio ni stock desde esta plataforma.");
  }

  setProductoEditando(producto);
  form.setFieldsValue(producto);
  setModalVisible(true);
};


  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");
      const payload: any = {};

      if (!productoEditando?.has_bids && values.price !== undefined) {
        payload.price = values.price;
      }
      if (!productoEditando?.catalog_listing && values.available_quantity !== undefined) {
        payload.available_quantity = values.available_quantity;
      }
      if (values.status !== undefined) {
        payload.status = values.status;
      }

      if (Object.keys(payload).length === 0) {
        message.warning("No hay cambios válidos para actualizar.");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${productoEditando?.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Producto actualizado con éxito.");
      setModalVisible(false);
      fetchProductos(pagina);
    } catch (err: any) {
      const causas = err?.response?.data?.ml_error?.cause || [];
      if (causas.length) {
        message.error(causas.map((e: any) => `• ${e.message}`).join("\n"));
      } else {
        message.error("Error al actualizar producto.");
      }
    }
  };

  const toggleEstado = async (producto: ProductoML) => {
    const nuevoEstado = producto.status === "active" ? "paused" : "active";
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${producto.id}`,
        { status: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`Producto ${nuevoEstado === "paused" ? "pausado" : "activado"} correctamente.`);
      fetchProductos(pagina);
    } catch {
      message.error("Error al cambiar estado del producto.");
    }
  };

  const mostrarDetalles = (producto: ProductoML) => {
    Modal.info({
      title: producto.title,
      content: (
        <div>
          <p><strong>ID:</strong> {producto.id}</p>
          <p><strong>Precio:</strong> ${producto.price}</p>
          <p><strong>Stock:</strong> {producto.available_quantity}</p>
          <p><strong>Estado:</strong> {producto.status}</p>
          <p><strong>Descripción:</strong></p>
          <p>{producto.description?.plain_text || "Sin descripción"}</p>
        </div>
      ),
      width: 600,
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>Gestión de Productos</Title>

      

      <Space direction="horizontal" wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Buscar por nombre o ID"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onSearch={(value) => {
            const esID = value.toUpperCase().startsWith("MLC");
            setBusqueda(value);
            setBusquedaActual(value);
            setPagina(1);
            fetchProductos(1, "date_created", "desc", value, esID ? undefined : fechaInicio, esID ? undefined : fechaFin, estadoFiltro);
          }}
          allowClear
          style={{ width: 280 }}
        />

        <DatePicker.RangePicker
          format="YYYY-MM-DD"
          onChange={(fechas) => {
            if (!fechas || !fechas[0] || !fechas[1]) {
              setFechaInicio(undefined);
              setFechaFin(undefined);
              fetchProductos(1, "date_created", "desc", busquedaActual, undefined, undefined, estadoFiltro);
              return;
            }
            const desde = fechas[0].format("YYYY-MM-DD");
            const hasta = fechas[1].format("YYYY-MM-DD");
            setFechaInicio(desde);
            setFechaFin(hasta);
            fetchProductos(1, "date_created", "desc", busquedaActual, desde, hasta, estadoFiltro);
          }}
          allowClear
        />

        <Select
          placeholder="Filtrar por estado"
          allowClear
          style={{ width: 200 }}
          onChange={(value) => {
            setEstadoFiltro(value);
            fetchProductos(1, "date_created", "desc", busquedaActual, fechaInicio, fechaFin, value);
          }}
        >
          <Option value="active">Activo</Option>
          <Option value="paused">Pausado</Option>
          <Option value="under_review">En revisión</Option>
        </Select>
      </Space>

      <TablaProductos
        productos={productos}
        loading={loading}
        pagina={pagina}
        total={total}
        fetchProductos={fetchProductos}
        setPagina={setPagina}
        handleEditar={handleEditar}
        toggleEstado={toggleEstado}
        busquedaActual={busquedaActual}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        estadoFiltro={estadoFiltro}
        mostrarDetalles={mostrarDetalles}
      />

      <Modal
  title="Editar Producto"
  open={modalVisible}
  onCancel={() => setModalVisible(false)}
  onOk={handleGuardar}
  okText="Guardar cambios"
>
  {productoEditando && (
    <>
      {!esEditable(productoEditando) && (
        <div
          style={{
            marginBottom: 16,
            backgroundColor: "#fff3cd",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #ffeeba",
          }}
        >
          <Text type="warning">
            ⚠️ Este producto no se puede editar porque fue publicado directamente desde Mercado Libre o ya tiene ventas registradas.
          </Text>
        </div>
      )}

      <Form layout="vertical" form={form}>
        <Form.Item
          label="Precio"
          name="price"
          rules={[{ required: true, message: "Ingrese el precio" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            disabled={!esEditable(productoEditando)}
          />
        </Form.Item>

        <Form.Item
          label="Stock disponible"
          name="available_quantity"
          rules={[{ required: true, message: "Ingrese el stock" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            disabled={!esEditable(productoEditando)}
          />
        </Form.Item>

        <Form.Item label="Estado del producto" name="status">
          <Select>
            <Option value="active">Activo</Option>
            <Option value="paused">Pausado</Option>
          </Select>
        </Form.Item>
      </Form>
    </>
  )}
</Modal>
    </div>
  );
}


export default EditarProductos;
