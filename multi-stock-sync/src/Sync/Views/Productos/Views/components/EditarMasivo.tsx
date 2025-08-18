import { useState, useEffect } from "react";
import axios from "axios";
import {
  InputNumber,
  Form,
  Select,
  Typography,
  message,
  Space,
  Button,
  Card,
  Divider,
  Badge,
  Tooltip,
  Table,
  Alert,
} from "antd";
import { 
  SaveOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LoadingOutlined
} from "@ant-design/icons";

import { useEditarProductos } from "../hook/useEditarProducto";

const { Title, Text } = Typography;
const { Option } = Select;

// Reutilizamos la misma interfaz de producto
interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  // Añadimos campos opcionales que puedan venir del hook
  catalog_listing?: boolean;
  sold_quantity?: number;
  user_product_id?: string;
}

// Interfaz para registrar los cambios
type CambiosType = Record<string, Partial<ProductoML>>;

const EditarMasivo = () => {
  const [form] = Form.useForm();
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  // Estados locales para la edición masiva
  const [productosEditables, setProductosEditables] = useState<ProductoML[]>([]);
  const [cambios, setCambios] = useState<CambiosType>({});
  const [guardando, setGuardando] = useState(false);

  // Reutilizamos el hook para obtener los productos
  const {
    productos,
    loading,
    pagina,
    setPagina,
    total,
    fetchProductos,
  } = useEditarProductos(conexion);

  // Sincronizamos el estado editable cuando los productos originales cambian (ej: paginación)
  useEffect(() => {
    // Usamos una copia profunda para evitar mutaciones no deseadas del estado original
    setProductosEditables(JSON.parse(JSON.stringify(productos)));
    // Limpiamos los cambios al cambiar de página o recargar datos
    setCambios({});
  }, [productos]);

  const esEditable = (producto: ProductoML) => {
    // Simplificamos la lógica: se puede editar si fue creado por el usuario.
    // Título, precio y stock tienen restricciones adicionales en la API de ML.
    return producto.user_product_id;
  };

  // Función centralizada para manejar los cambios en los inputs de la tabla
  const handleInputChange = (id: string, campo: keyof ProductoML, valor: any) => {
    // 1. Actualiza el estado visual de la tabla
    setProductosEditables(prev =>
      prev.map(p => (p.id === id ? { ...p, [campo]: valor } : p))
    );

    // 2. Registra el cambio para el guardado posterior
    setCambios(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const handleDescartarCambios = () => {
    // Vuelve al estado original de los productos
    setProductosEditables(JSON.parse(JSON.stringify(productos)));
    setCambios({});
    message.info("Los cambios han sido descartados.");
  };

  const handleGuardarMasivo = async () => {
    setGuardando(true);
    const idsCambiados = Object.keys(cambios);
    const token = localStorage.getItem("token");

    const promesas = idsCambiados.map(id => {
      const payload = cambios[id];
      // Filtramos para no enviar el 'id' o 'title' en el payload si no se permite
      const { title, ...updatePayload } = payload;
      
      const productoOriginal = productos.find(p => p.id === id);
      const puedeEditarPrecioYStock = !productoOriginal?.catalog_listing && productoOriginal?.sold_quantity === 0;

      if (!puedeEditarPrecioYStock) {
        delete updatePayload.price;
        delete updatePayload.available_quantity;
      }
      
      // Permitir la edición de título está desactivado por defecto en la API de ML para publicaciones activas.
      // Por ahora, lo excluimos del guardado masivo para evitar errores. Se podría habilitar con lógica adicional.

      return axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${id}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => ({ id, error: err })); // Capturamos errores por producto
    });

    const resultados = await Promise.allSettled(promesas);

    let exitosos = 0;
    let fallidos = 0;

    resultados.forEach(resultado => {
      if (resultado.status === 'fulfilled' && !resultado.value) {
        exitosos++;
      } else {
        fallidos++;
      }
    });

    if (exitosos > 0) {
      message.success(`${exitosos} producto(s) actualizado(s) correctamente.`);
    }
    if (fallidos > 0) {
      message.error(`${fallidos} producto(s) no pudieron ser actualizados. Revisa las restricciones de edición.`);
    }

    setGuardando(false);
    setCambios({});
    fetchProductos(pagina); // Recargamos los datos desde el servidor
  };

  const numeroDeCambios = Object.keys(cambios).length;

  const columns = [
    {
      title: "Título del Producto",
      dataIndex: "title",
      width: "40%",
      render: (_: any, record: ProductoML) => {
        // La edición de título es muy restringida en ML, por lo que lo dejamos como no editable.
        // Si se necesitara, se cambiaría por un Input, pero podría dar muchos errores.
        return <Text>{record.title}</Text>;
      },
    },
    {
      title: "Precio",
      dataIndex: "price",
      width: "15%",
      render: (price: number, record: ProductoML) => (
        <InputNumber
          value={price}
          onChange={(valor) => handleInputChange(record.id, "price", valor)}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          
          style={{ width: "100%" }}
          disabled={!esEditable(record) || record.catalog_listing || (record.sold_quantity ?? 0) > 0}
        />
      ),
    },
    {
      title: "Stock",
      dataIndex: "available_quantity",
      width: "15%",
      render: (stock: number, record: ProductoML) => (
        <InputNumber
          value={stock}
          min={0}
          onChange={(valor) => handleInputChange(record.id, "available_quantity", valor)}
          style={{ width: "100%" }}
          disabled={!esEditable(record) || record.catalog_listing}
        />
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: "15%",
      render: (status: string, record: ProductoML) => (
        <Select
          value={status}
          onChange={(valor) => handleInputChange(record.id, "status", valor)}
          style={{ width: "100%" }}
          disabled={!esEditable(record)}
        >
          <Option value="active"><Badge status="success" text="Activo" /></Option>
          <Option value="paused"><Badge status="warning" text="Pausado" /></Option>
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Edición Masiva de Productos
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Modifica tus productos directamente en la tabla y guarda todos los cambios a la vez.
            </Text>
          </div>
          <Tooltip title="Actualizar lista de productos">
            <Button
              shape="circle"
              icon={<SyncOutlined />}
              onClick={() => fetchProductos(pagina)}
              loading={loading}
              size="large"
            />
          </Tooltip>
        </div>
        <Divider />
        
        <Alert
          message="Nota sobre la edición"
          description="MercadoLibre no permite editar precio y stock en publicaciones de catálogo o que ya tienen ventas. Esos campos aparecerán deshabilitados."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} component={false}>
          <Table
            bordered
            dataSource={productosEditables}
            columns={columns}
            rowClassName={(record) => (cambios[record.id] ? "fila-modificada" : "")}
            pagination={{
              current: pagina,
              pageSize: 50, // ML permite hasta 50 por página
              total: total,
              onChange: (page) => {
                setPagina(page);
                fetchProductos(page);
              },
              showSizeChanger: false
            }}
            loading={loading}
            rowKey="id"
            scroll={{ x: 800 }}
          />
        </Form>
      </Card>

      {/* Barra de acciones flotante */}
      {numeroDeCambios > 0 && (
        <Card
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: 12
          }}
          bodyStyle={{ padding: "16px 24px" }}
        >
          <Space align="center" size="large">
            <Text strong style={{ fontSize: 16 }}>
              <Badge count={numeroDeCambios} /> cambios sin guardar
            </Text>
            <Space>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={handleDescartarCambios}
                disabled={guardando}
              >
                Descartar
              </Button>
              <Button
                type="primary"
                icon={guardando ? <LoadingOutlined /> : <SaveOutlined />}
                onClick={handleGuardarMasivo}
                loading={guardando}
              >
                Guardar Cambios
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* Estilos para resaltar filas modificadas */}
      <style>{`
        .fila-modificada td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default EditarMasivo;