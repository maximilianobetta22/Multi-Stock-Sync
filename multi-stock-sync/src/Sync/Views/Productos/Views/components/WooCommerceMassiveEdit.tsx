import React, { useState, useEffect } from "react";
import {
  InputNumber,
  Form,
  Select,
  Typography,
  message,
  Space,
  Input,
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
  LoadingOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import useWooCommerceProducts from "../hook/useWooCommerceProducts";
import { WooCommerceService } from "../Services/woocommerceService";
import type { WooCommerceProduct } from "../Types/woocommerceTypes";

const { Title, Text } = Typography;
const { Option } = Select;

// Interfaz para registrar los cambios. El ID de producto de Woo es un número.
type CambiosType = Record<number, Partial<WooCommerceProduct>>;

const WooCommerceMassiveEdit: React.FC = () => {
  const [form] = Form.useForm();

  // Estados locales para la edición masiva
  const [productosEditables, setProductosEditables] = useState<WooCommerceProduct[]>([]);
  const [cambios, setCambios] = useState<CambiosType>({});
  const [guardando, setGuardando] = useState(false);
  const [mappedStoreId, setMappedStoreId] = useState<number | null>(null);

  // Reutilizamos el hook para obtener los productos
  const {
    products,
    totalProducts,
    loading,
    loadProducts,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useWooCommerceProducts({ autoLoad: false });

  // Cargar productos al montar el componente si hay una tienda mapeada
  useEffect(() => {
    const storeId = WooCommerceService.getCurrentWooCommerceStoreId();
    if (storeId) {
      setMappedStoreId(storeId);
      loadProducts(1, 20); // Carga inicial
      setCurrentPage(1);
      setPageSize(20);
    }
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Sincronizamos el estado editable cuando los productos originales cambian
  useEffect(() => {
    setProductosEditables(JSON.parse(JSON.stringify(products)));
    setCambios({}); // Limpiamos cambios al recargar o paginar
  }, [products]);

  // Función para manejar los cambios en los inputs de la tabla
  const handleInputChange = (id: number, campo: keyof WooCommerceProduct, valor: any) => {
    setProductosEditables(prev =>
      prev.map(p => (p.id === id ? { ...p, [campo]: valor } : p))
    );

    setCambios(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const handleDescartarCambios = () => {
    setProductosEditables(JSON.parse(JSON.stringify(products)));
    setCambios({});
    message.info("Los cambios han sido descartados.");
  };

  const handleGuardarMasivo = async () => {
    if (!mappedStoreId) {
      message.error("No se ha seleccionado una tienda válida para guardar los cambios.");
      return;
    }

    setGuardando(true);
    const idsCambiados = Object.keys(cambios).map(Number); // Convertir keys a números
    
    const promesas = idsCambiados.map(id => {
      const updatedData = cambios[id];
      // La API de Woo espera precios como strings
      if (updatedData.regular_price !== undefined) {
        updatedData.regular_price = String(updatedData.regular_price);
      }
      
      return WooCommerceService.updateProduct({
        storeId: mappedStoreId,
        productId: id,
        updatedData,
      }).catch(err => ({ id, error: err })); // Capturamos errores por producto
    });

    const resultados = await Promise.allSettled(promesas);

    let exitosos = 0;
    let fallidos = 0;

    resultados.forEach(resultado => {
      if (resultado.status === 'fulfilled' && !resultado.value?.error) {
        exitosos++;
      } else {
        fallidos++;
        console.error("Error actualizando producto:", resultado || resultado);
      }
    });

    if (exitosos > 0) {
      message.success(`${exitosos} producto(s) actualizado(s) correctamente.`);
    }
    if (fallidos > 0) {
      message.error(`${fallidos} producto(s) no pudieron ser actualizados.`);
    }

    setGuardando(false);
    setCambios({});
    loadProducts(currentPage, pageSize); // Recargamos los datos
  };

  const numeroDeCambios = Object.keys(cambios).length;

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      width: "30%",
      render: (name: string, record: WooCommerceProduct) => (
        <Input
          value={name}
          onChange={(e) => handleInputChange(record.id, "name", e.target.value)}
        />
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      width: "15%",
      render: (sku: string, record: WooCommerceProduct) => (
        <Input
          value={sku}
          onChange={(e) => handleInputChange(record.id, "sku", e.target.value)}
        />
      ),
    },
    {
      title: "Precio Regular",
      dataIndex: "regular_price",
      width: "15%",
      render: (price: string, record: WooCommerceProduct) => (
        <InputNumber
          value={Number(price) || 0}
          onChange={(valor) => handleInputChange(record.id, "regular_price", valor)}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock_quantity",
      width: "15%",
      render: (stock: number | null, record: WooCommerceProduct) => (
        <InputNumber
          value={stock}
          min={0}
          onChange={(valor) => handleInputChange(record.id, "stock_quantity", valor)}
          style={{ width: "100%" }}
          placeholder="Sin gestión"
        />
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      width: "15%",
      render: (status: string, record: WooCommerceProduct) => (
        <Select
          value={status}
          onChange={(valor) => handleInputChange(record.id, "status", valor)}
          style={{ width: "100%" }}
        >
          <Option value="publish"><Badge status="success" text="Publicado" /></Option>
          <Option value="draft"><Badge status="warning" text="Borrador" /></Option>
          <Option value="pending"><Badge status="processing" text="Pendiente" /></Option>
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#9b59b6' }}>
              <ShopOutlined /> Edición Masiva (WooCommerce)
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Modifica tus productos de WooCommerce directamente en la tabla.
            </Text>
          </div>
          <Tooltip title="Actualizar lista de productos">
            <Button
              shape="circle"
              icon={<SyncOutlined />}
              onClick={() => loadProducts(currentPage, pageSize)}
              loading={loading}
              size="large"
            />
          </Tooltip>
        </div>
        <Divider />
        
        <Alert
          message="Modo de Edición Rápida"
          description="Realiza cambios en múltiples productos y guárdalos todos a la vez. Las filas modificadas se resaltarán en color lavanda."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} component={false}>
          <Table
            bordered
            dataSource={productosEditables}
            columns={columns}
            rowClassName={(record) => (cambios[record.id] ? "fila-modificada-woo" : "")}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalProducts,
              onChange: (page, size) => {
                loadProducts(page, size);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            }}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
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
            borderRadius: 12,
            border: '1px solid #d3adf7'
          }}
          bodyStyle={{ padding: "16px 24px" }}
        >
          <Space align="center" size="large">
            <Text strong style={{ fontSize: 16 }}>
              <Badge count={numeroDeCambios} style={{ backgroundColor: '#722ed1' }}/> cambios sin guardar
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
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              >
                Guardar Cambios
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* Estilos para resaltar filas modificadas */}
      <style>{`
        .fila-modificada-woo td {
          background-color: #f9f0ff !important;
        }
      `}</style>
    </div>
  );
};

export default WooCommerceMassiveEdit;