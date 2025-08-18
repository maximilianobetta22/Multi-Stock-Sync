import React from "react";
import { Card, Typography, Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusCircleOutlined,
  FileExcelOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ShopOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Opcion {
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  ruta: string;
  color: string;
  bgColor: string;
}

const GestionProducto: React.FC = () => {
  const navigate = useNavigate();

  const opciones: Opcion[] = [
    {
      icon: <PlusCircleOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Subir producto individual",
      descripcion: "Carga manual de un producto nuevo con sus atributos completos.",
      ruta: "/sync/productos/crear",
      color: "#3498db",
      bgColor: "#ebf3fd"
    },
    {
      icon: <FileExcelOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Carga masiva desde Excel",
      descripcion: "Carga múltiples productos mediante archivo Excel.",
      ruta: "/sync/productos/carga-masiva",
      color: "#27ae60",
      bgColor: "#eafaf1"
    },
    {
      icon: <TagsOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Plantillas Mercado Libre",
      descripcion: "Descarga plantillas de Excel por categoría para carga masiva.",
      ruta: "/sync/productos/plantillas-mercadolibre",
      color: "#9b59b6",
      bgColor: "#f4ecf7"
    },
    {
      icon: <ShopOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Productos WooCommerce",
      descripcion: "Visualiza y gestiona productos de tus tiendas WooCommerce.",
      ruta: "/sync/productos/woocommerce",
      color: "#17a2b8",
      bgColor: "#e1f7fa"
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Productos publicados desde Mercado Libre",
      descripcion: "Visualiza y gestiona productos publicados en Mercado Libre.",
      ruta: "/sync/productos/editar",
      color: "#f39c12",
      bgColor: "#fef9e7"
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Editor de productos masivos",
      descripcion: "Edita productos publicados en Mercado Libre.",
      ruta: "/sync/productos/editar-masivo",
      color: "#ca7e04ff",
      bgColor: "#fef9e7"
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 40, color: "#FFFFFF" }} />,
      titulo: "Editor de productos masivos",
      descripcion: "Edita productos publicados en Woocomerce.",
      ruta: "/sync/productos/editar-masivo-woocomerce",
      color: "#2c60f0ff",
      bgColor: "#fef9e7"
    },
  ];

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            
            <Title level={2} style={{ 
              margin: 0, 
              color: '#2c3e50',
              fontSize: 28,
              fontWeight: 700
            }}>
              Gestión de Productos
            </Title>
          </div>
          <Text style={{ 
            fontSize: 16,
            color: '#7f8c8d',
            display: 'block'
          }}>
            Administra tu inventario de manera eficiente con estas herramientas especializadas
          </Text>
        </div>

        {/* Products Grid */}
        <Row gutter={[24, 24]}>
          {opciones.map((opcion, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #ecf0f1',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  background: '#ffffff'
                }}
                bodyStyle={{ padding: 0, height: '100%' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 12px 28px ${opcion.color}20`;
                  e.currentTarget.style.borderColor = opcion.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = '#ecf0f1';
                }}
              >
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header con color específico */}
                  <div style={{
                    backgroundColor: opcion.color,
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {/* Patrón decorativo */}
                    <div style={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      opacity: 0.6
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: -15,
                      left: -15,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      opacity: 0.4
                    }} />
                    
                    <div style={{ 
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {opcion.icon}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div style={{ 
                    padding: '1.5rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <Title level={4} style={{ 
                        color: '#2c3e50',
                        marginBottom: '0.75rem',
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3
                      }}>
                        {opcion.titulo}
                      </Title>
                      
                      <Text style={{ 
                        color: '#5d6d7e',
                        fontSize: 14,
                        lineHeight: 1.5,
                        display: 'block',
                        marginBottom: '1.5rem'
                      }}>
                        {opcion.descripcion}
                      </Text>
                    </div>
                    
                    {/* Botón mejorado */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate(opcion.ruta)}
                      style={{
                        backgroundColor: opcion.color,
                        borderColor: opcion.color,
                        borderRadius: '8px',
                        height: '44px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      Ingresar
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

      </div>
    </div>
  );
};

export default GestionProducto;
// Este componente es una vista de gestión de productos que permite al usuario
// seleccionar entre varias opciones para gestionar sus productos. Cada opción
// Este componente es una vista de gestión de productos que permite al usuario
// seleccionar entre varias opciones para gestionar sus productos. Cada opción