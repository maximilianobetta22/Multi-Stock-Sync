import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Row, Col, Typography, Card } from 'antd';
import {
  ShoppingOutlined,
  ShopOutlined,
  CarOutlined,
  SettingOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Module {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const HomeSync: React.FC = () => {
  const navigate = useNavigate();
  const [conexionActual, setConexionActual] = useState<any>(null);

  useEffect(() => {
    const conexionSeleccionada = localStorage.getItem('conexionSeleccionada');
    if (!conexionSeleccionada) {
      navigate('/sync/seleccionar-conexion');
      return;
    }
    
    try {
      const parsed = JSON.parse(conexionSeleccionada);
      setConexionActual(parsed);
    } catch {
      navigate('/sync/seleccionar-conexion');
    }
  }, [navigate]);

  // Paleta colores más saturados y vibrantes
  const modules: Module[] = [
    { 
      title: 'Gestión de Productos', 
      description: 'Administra de forma centralizada todos tus productos, puedes cargar artículos, importar desde Excel, sincronizar con WooCommerce o Mercado Libre', 
      icon: <ShoppingOutlined style={{ fontSize: 48, color: '#FFFFFF' }} />, 
      link: '/sync/productos',
      color: '#dc2626' // Rojo más intenso y saturado
    },
    { 
      title: 'Punto de Venta', 
      description: 'Crea y gestiona ventas de forma rápida y ordenada. Selecciona la bodega, agrega productos, asigna un cliente y genera tus notas de venta en segundos.', 
      icon: <ShopOutlined style={{ fontSize: 48, color: '#FFFFFF' }} />, 
      link: '/sync/punto-de-venta',
      color: '#1d4ed8' // Azul más vibrante y potente
    },
    { 
      title: 'Gestión de Envíos', 
      description: 'Administra y monitorea todos tus envíos desde un solo lugar. Consulta envíos del día, próximos despachos y estado de tránsito.', 
      icon: <CarOutlined style={{ fontSize: 48, color: '#FFFFFF' }} />, 
      link: '/sync/envios',
      color: '#059669' // Verde más intenso
    },
    { 
      title: 'Configuración', 
      description: 'Personaliza y ajusta las opciones clave de tu sistema. Define preferencias generales, integra servicios externos y adapta la plataforma.', 
      icon: <SettingOutlined style={{ fontSize: 48, color: '#FFFFFF' }} />, 
      link: '/sync/configuracion',
      color: '#ea580c' // Naranja más saturado
    },
    { 
      title: 'Gestión de Usuarios', 
      description: 'Administra los accesos y roles dentro de la plataforma. Crea, edita usuarios y asigna permisos para mantener la seguridad.', 
      icon: <UserOutlined style={{ fontSize: 48, color: '#FFFFFF' }} />, 
      link: '/sync/gestion-usuarios',
      color: '#7c3aed' // Púrpura más vibrante
    },
  ];

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '2rem 1rem 4rem 1rem'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Title level={2} style={{ 
            color: '#2c3e50',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: '0.5rem',
            borderBottom: '3px solid #dc2626', // Rojo más intenso también aquí
            paddingBottom: '0.5rem',
            display: 'inline-block'
          }}>
            Panel de Sincronización
          </Title>
          
          {conexionActual && (
            <Text style={{ 
              color: '#7f8c8d',
              fontSize: 16,
              display: 'block',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              Conectado como: <span style={{ fontWeight: 600, color: '#dc2626' }}>{conexionActual.nickname}</span>
            </Text>
          )}
          
          <Text style={{ 
            fontSize: 16,
            color: '#7f8c8d',
            display: 'block'
          }}>
            Administra todos los aspectos de tu negocio desde un solo lugar
          </Text>
        </div>

        {/* Modules Grid */}
        <Row gutter={[24, 32]} justify="center">
          {modules.map((module, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Link to={module.link} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #ecf0f1',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    height: '420px',
                    background: '#ffffff'
                  }}
                  bodyStyle={{ padding: 0, height: '100%' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${module.color}25`; // Sombra con el color del módulo
                    e.currentTarget.style.borderColor = module.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#ecf0f1';
                  }}
                >
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header con colores más saturados */}
                    <div style={{
                      backgroundColor: module.color,
                      background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`, // Gradiente sutil
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {/* Patrón decorativo más visible */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 1px, transparent 1px),
                                         radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }} />
                      
                      <div style={{ 
                        marginBottom: '1rem',
                        position: 'relative',
                        zIndex: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' // Sombra en el ícono
                      }}>
                        {module.icon}
                      </div>
                      
                      <Title level={4} style={{ 
                        color: '#ffffff', 
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' // Sombra más pronunciada
                      }}>
                        {module.title}
                      </Title>
                    </div>

                    {/* Contenido */}
                    <div style={{ 
                      padding: '1.5rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: '#ffffff'
                    }}>
                      <Text style={{ 
                        color: '#5d6d7e',
                        fontSize: 14,
                        lineHeight: 1.6,
                        marginBottom: '1.5rem'
                      }}>
                        {module.description}
                      </Text>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: module.color,
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '0.5rem 0',
                        borderTop: `2px solid ${module.color}30` // Borde más visible
                      }}>
                        <ArrowRightOutlined style={{ fontSize: 12 }} />
                        <span>Acceder al módulo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '2rem',
          borderTop: '1px solid #ecf0f1'
        }}>
          <Text style={{
            color: '#95a5a6',
            fontSize: 14
          }}>
            Crazy Family © 2024 - 2025 - Software de Gestión Empresarial
          </Text>
        </div>
      </div>
    </div>
  );
};

export default HomeSync;