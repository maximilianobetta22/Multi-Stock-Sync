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
  Button,
  Popconfirm,
  Card,
  Divider,
  Badge,
  Tooltip,
  Row,
  Col,
} from "antd";
import { 
  FilePdfOutlined, 
  FileExcelOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  DownloadOutlined,
  SyncOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { useEditarProductos } from "../hook/useEditarProducto";
import { TablaProductos } from "./TablaProductos";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Interfaz para jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Estados para funcionalidad de duplicados
  const [duplicadosVisible, setDuplicadosVisible] = useState(false);
  const [duplicadosEncontrados, setDuplicadosEncontrados] = useState<any[]>([]);
  const [loadingDuplicados, setLoadingDuplicados] = useState(false);

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
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EyeOutlined />
          <span>Detalles del Producto</span>
        </div>
      ),
      content: (
        <div style={{ marginTop: 16 }}>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 8]}>
              <Col span={8}><Text strong>ID:</Text></Col>
              <Col span={16}><Text code>{producto.id}</Text></Col>
              
              <Col span={8}><Text strong>Precio:</Text></Col>
              <Col span={16}><Text>${producto.price?.toLocaleString('es-CL')}</Text></Col>
              
              <Col span={8}><Text strong>Stock:</Text></Col>
              <Col span={16}>
                <Badge 
                  count={producto.available_quantity} 
                  style={{ backgroundColor: producto.available_quantity > 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Col>
              
              <Col span={8}><Text strong>Estado:</Text></Col>
              <Col span={16}>
                <Badge 
                  status={producto.status === 'active' ? 'success' : 'warning'} 
                  text={producto.status === 'active' ? 'Activo' : 'Pausado'} 
                />
              </Col>
              
              <Col span={8}><Text strong>Ventas:</Text></Col>
              <Col span={16}><Text>{producto.sold_quantity || 0} unidades</Text></Col>
            </Row>
          </Card>
          
          <div>
            <Text strong>Descripción:</Text>
            <div style={{ 
              marginTop: 8, 
              padding: 12, 
              backgroundColor: '#fafafa', 
              borderRadius: 6,
              maxHeight: 200,
              overflow: 'auto'
            }}>
              <Text>{producto.description?.plain_text || "Sin descripción disponible"}</Text>
            </div>
          </div>
        </div>
      ),
      width: 700,
      okText: "Cerrar",
    });
  };

  // Funciones de exportacion
  const exportToExcel = () => {
    if (productos.length === 0) {
      message.warning("No hay productos para exportar.");
      return;
    }
    const datos = productos.map((p) => ({
      ID: p.id,
      Título: p.title,
      Precio: p.price,
      Stock: p.available_quantity,
      Estado: p.status,
      "Ventas Registradas": p.sold_quantity ?? 0,
      "Fecha Creación": p.date_created ? new Date(p.date_created).toLocaleDateString("es-CL") : "N/A"
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "gestion_productos.xlsx");
    message.success("Archivo Excel exportado exitosamente");
  };

  const exportToPDF = () => {
    if (productos.length === 0) {
      message.warning("No hay productos para exportar.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Gestión de Productos", 14, 15);
    doc.autoTable({
      head: [["ID", "Título", "Precio", "Stock", "Estado"]],
      body: productos.map((p) => [
        p.id,
        p.title,
        `$${p.price.toLocaleString("es-CL")}`,
        p.available_quantity,
        p.status
      ]),
      startY: 20,
    });
    const blob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(blob));
    setPdfPreviewVisible(true);
  };
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Gestión de Productos", 14, 15);
    doc.autoTable({
      head: [["ID", "Título", "Precio", "Stock", "Estado"]],
      body: productos.map((p) => [
        p.id,
        p.title,
        `$${p.price.toLocaleString("es-CL")}`,
        p.available_quantity,
        p.status
      ]),
      startY: 20,
    });
    doc.save("gestion_productos.pdf");
    setPdfPreviewVisible(false);
    message.success("Archivo PDF descargado exitosamente");
  }

  // Funciones para detección de duplicados
  const normalizarTitulo = (titulo: string): string => {
    return titulo
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, ' '); // Normalizar espacios
  };

  const detectarDuplicados = () => {
    if (productos.length === 0) {
      message.warning("No hay productos cargados para analizar.");
      return;
    }

    setLoadingDuplicados(true);
    
    // Crear un mapa de títulos normalizados
    const mapaProductos = new Map<string, ProductoML[]>();
    
    productos.forEach(producto => {
      const tituloNormalizado = normalizarTitulo(producto.title);
      
      if (!mapaProductos.has(tituloNormalizado)) {
        mapaProductos.set(tituloNormalizado, []);
      }
      mapaProductos.get(tituloNormalizado)!.push(producto);
    });

    // Filtrar solo los grupos que tienen más de un producto
    const duplicados = Array.from(mapaProductos.entries())
      .filter(([, productos]) => productos.length > 1)
      .map(([tituloNormalizado, productos]) => ({
        tituloNormalizado,
        productos,
        cantidad: productos.length
      }));

    setDuplicadosEncontrados(duplicados);
    setLoadingDuplicados(false);
    setDuplicadosVisible(true);

    if (duplicados.length === 0) {
      message.success("¡Genial! No se encontraron productos duplicados.");
    }
  };

  const eliminarProductoDuplicado = async (productoId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/mercadolibre/delete/${conexion.client_id}/${productoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      message.success("Producto eliminado exitosamente.");
      
      // Actualizar la lista de duplicados
      const duplicadosActualizados = duplicadosEncontrados.map(grupo => {
        const productosRestantes = grupo.productos.filter((p: ProductoML) => p.id !== productoId);
        return {
          ...grupo,
          productos: productosRestantes,
          cantidad: productosRestantes.length
        };
      }).filter(grupo => grupo.cantidad > 1);
      
      setDuplicadosEncontrados(duplicadosActualizados);
      
      // Refrescar la lista principal
      fetchProductos(pagina);
      
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || "Error al eliminar el producto";
      message.error(mensaje);
    }
  };

  return (
    <div style={{ 
      padding: "24px", 
      backgroundColor: "#f5f5f5", 
      minHeight: "100vh" 
    }}>
      <Card 
        style={{ 
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
             Gestión de Productos
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Administra tu catálogo de productos de MercadoLibre
          </Text>
        </div>

        <Divider />

        {/* Filtros y Acciones */}
        <Card 
          size="small" 
          title={
            <span>
              <FilterOutlined style={{ marginRight: 8 }} />
              Filtros y Herramientas
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            {/* Primera fila - Filtros */}
            <Col xs={24} sm={12} lg={8}>
              <Input.Search
                placeholder="Buscar por nombre o ID del producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onSearch={(value) => {
                  const esID = value.toUpperCase().startsWith("MLC");
                  setBusquedaActual(value);
                  setPagina(1);
                  fetchProductos(1, "date_created", "desc", value, esID ? undefined : fechaInicio, esID ? undefined : fechaFin, estadoFiltro);
                }}
                allowClear
                size="large"
                style={{ width: '100%' }}
                enterButton="Buscar"
              />
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <RangePicker
                placeholder={['Fecha inicio', 'Fecha fin']}
                format="DD/MM/YYYY"
                onChange={(fechas) => {
                  if (!fechas || !fechas[0] || !fechas[1]) {
                    setFechaInicio(undefined);
                    setFechaFin(undefined);
                    setPagina(1);
                    fetchProductos(1, "date_created", "desc", busquedaActual, undefined, undefined, estadoFiltro);
                    return;
                  }
                  const desde = fechas[0].format("YYYY-MM-DD");
                  const hasta = fechas[1].format("YYYY-MM-DD");
                  setFechaInicio(desde);
                  setFechaFin(hasta);
                  setPagina(1);
                  fetchProductos(1, "date_created", "desc", busquedaActual, desde, hasta, estadoFiltro);
                }}
                allowClear
                size="large"
                style={{ width: '100%' }}
              />
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Select
                placeholder="Filtrar por estado"
                allowClear
                size="large"
                style={{ width: '100%' }}
                value={estadoFiltro}
                onChange={(value) => {
                  setEstadoFiltro(value);
                  setPagina(1);
                  fetchProductos(1, "date_created", "desc", busquedaActual, fechaInicio, fechaFin, value);
                }}
              >
                <Option value="active">
                  <Badge status="success" text="Activo" />
                </Option>
                <Option value="paused">
                  <Badge status="warning" text="Pausado" />
                </Option>
                <Option value="under_review">
                  <Badge status="processing" text="En revisión" />
                </Option>
              </Select>
            </Col>

            {/* Segunda fila - Acciones */}
            <Col xs={24}>
              <Space wrap>
                <Tooltip title="Exportar datos a Excel">
                  <Button
                    type="primary"
                    ghost
                    icon={<FileExcelOutlined />}
                    onClick={exportToExcel}
                    style={{ 
                      borderColor: '#52c41a', 
                      color: '#52c41a',
                      fontWeight: 500
                    }}
                  >
                    Exportar Excel
                  </Button>
                </Tooltip>

                <Tooltip title="Buscar productos duplicados">
                  <Button
                    type="primary"
                    ghost
                    icon={<SearchOutlined />}
                    onClick={detectarDuplicados}
                    loading={loadingDuplicados}
                    style={{ 
                      borderColor: '#fa8c16', 
                      color: '#fa8c16',
                      fontWeight: 500
                    }}
                  >
                    Detectar Duplicados
                  </Button>
                </Tooltip>

                <Tooltip title="Actualizar lista de productos">
                  <Button
                    icon={<SyncOutlined />}
                    onClick={() => {
                      setPagina(1);
                      fetchProductos(1, "date_created", "desc", busquedaActual, fechaInicio, fechaFin, estadoFiltro);
                    }}
                    loading={loading}
                  >
                    Actualizar
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabla de productos */}
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
      </Card>

      {/* Modal para editar producto */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✏️ Editar Producto</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleGuardar}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        width={600}
        okButtonProps={{ 
          style: { 
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
            fontWeight: 500
          }
        }}
      >
        {productoEditando && (
          <>
            {!esEditable(productoEditando) && (
              <Card
                size="small"
                style={{
                  marginBottom: 20,
                  backgroundColor: "#fff7e6",
                  border: "1px solid #ffd591",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  <Text style={{ color: '#d46b08' }}>
                    <strong>Producto no editable:</strong> Este producto fue publicado directamente desde MercadoLibre o ya tiene ventas registradas.
                  </Text>
                </div>
              </Card>
            )}

            <Form layout="vertical" form={form}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="💰 Precio"
                    name="price"
                    rules={[{ required: true, message: "Ingrese el precio" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      size="large"
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Ingrese el precio"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="📦 Stock disponible"
                    name="available_quantity"
                    rules={[{ required: true, message: "Ingrese el stock" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="Cantidad en stock"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="🔄 Estado del producto" name="status">
                <Select size="large" placeholder="Seleccione el estado">
                  <Option value="active">
                    <Badge status="success" text="Activo" />
                  </Option>
                  <Option value="paused">
                    <Badge status="warning" text="Pausado" />
                  </Option>
                </Select>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Modal para previsualizar el PDF */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilePdfOutlined />
            <span>Vista Previa del Reporte PDF</span>
          </div>
        }
        open={pdfPreviewVisible}
        onCancel={() => setPdfPreviewVisible(false)}
        width="90%"
        footer={[
          <Button key="back" onClick={() => setPdfPreviewVisible(false)}>
            Cerrar
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Descargar PDF
          </Button>,
        ]}
      >
        {pdfUrl && (
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="600px" 
            title="Vista previa del PDF"
            style={{ border: 'none', borderRadius: 8 }}
          />
        )}
      </Modal>

      {/* Modal para mostrar productos duplicados */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchOutlined style={{ color: '#fa8c16' }} />
            <span>Análisis de Productos Duplicados</span>
            {duplicadosEncontrados.length > 0 && (
              <Badge 
                count={duplicadosEncontrados.length} 
                style={{ backgroundColor: '#ff4d4f' }}
              />
            )}
          </div>
        }
        open={duplicadosVisible}
        onCancel={() => setDuplicadosVisible(false)}
        width="95%"
        footer={[
          <Button key="close" onClick={() => setDuplicadosVisible(false)}>
            Cerrar Análisis
          </Button>
        ]}
      >
        {duplicadosEncontrados.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: 64, 
                color: '#52c41a', 
                marginBottom: 24 
              }} 
            />
            <Title level={3} style={{ color: '#52c41a', marginBottom: 8 }}>
              ¡Catálogo Optimizado!
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              No se encontraron productos duplicados. Tu catálogo está bien organizado.
            </Text>
          </Card>
        ) : (
          <div>
            <Card 
              size="small" 
              style={{ 
                marginBottom: 24, 
                backgroundColor: '#fff7e6',
                border: '1px solid #ffd591'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                <Text>
                  Se encontraron <strong>{duplicadosEncontrados.length} grupos</strong> de productos con títulos similares.
                  Revisa cuidadosamente antes de eliminar duplicados.
                </Text>
              </div>
            </Card>
            
            {duplicadosEncontrados.map((grupo, index) => (
              <Card 
                key={index}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge count={grupo.cantidad} style={{ backgroundColor: '#fa8c16' }} />
                    <span>Grupo {index + 1}: {grupo.cantidad} productos similares</span>
                  </div>
                }
                style={{ marginBottom: 16 }}
                size="small"
              >
                <Row gutter={[16, 16]}>
                  {grupo.productos.map((producto: ProductoML) => (
                    <Col span={24} key={producto.id}>
                      <Card 
                        size="small"
                        style={{ 
                          backgroundColor: '#fafafa',
                          border: '1px solid #e8e8e8'
                        }}
                      >
                        <Row align="middle" justify="space-between">
                          <Col flex="auto">
                            <div style={{ marginBottom: 8 }}>
                              <Text strong style={{ fontSize: 16 }}>
                                {producto.title}
                              </Text>
                            </div>
                            <Space wrap>
                              <Text code>{producto.id}</Text>
                              <Badge 
                                count={`$${producto.price?.toLocaleString('es-CL')}`} 
                                style={{ backgroundColor: '#1890ff' }}
                              />
                              <Badge 
                                count={`${producto.available_quantity} stock`} 
                                style={{ backgroundColor: producto.available_quantity > 0 ? '#52c41a' : '#ff4d4f' }}
                              />
                              <Badge 
                                status={producto.status === 'active' ? 'success' : 'warning'}
                                text={producto.status === 'active' ? 'Activo' : 'Pausado'}
                              />
                              {producto.sold_quantity && producto.sold_quantity > 0 && (
                                <Badge 
                                  count={`${producto.sold_quantity} vendidos`} 
                                  style={{ backgroundColor: '#52c41a' }}
                                />
                              )}
                            </Space>
                          </Col>
                          
                          <Col>
                            <Space>
                              <Tooltip title="Ver detalles completos">
                                <Button 
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => mostrarDetalles(producto)}
                                />
                              </Tooltip>
                              
                              <Tooltip title="Editar producto">
                                <Button 
                                  size="small"
                                  type="primary"
                                  ghost
                                  onClick={() => handleEditar(producto)}
                                >
                                  Editar
                                </Button>
                              </Tooltip>
                              
                              <Popconfirm
                                title="¿Eliminar producto duplicado?"
                                description={
                                  <div style={{ maxWidth: 300 }}>
                                    <Text>¿Estás seguro de eliminar este producto?</Text>
                                    <br />
                                    <Text strong>"{producto.title}"</Text>
                                  </div>
                                }
                                onConfirm={() => eliminarProductoDuplicado(producto.id)}
                                okText="Sí, eliminar"
                                cancelText="Cancelar"
                                okType="danger"
                              >
                                <Button 
                                  size="small" 
                                  danger
                                  disabled={Boolean(producto.sold_quantity && producto.sold_quantity > 0)}
                                >
                                  Eliminar
                                </Button>
                              </Popconfirm>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EditarProductos;