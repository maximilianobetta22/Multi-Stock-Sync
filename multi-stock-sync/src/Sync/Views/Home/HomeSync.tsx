// src/pages/HomeSync.tsx
import React, { useEffect } from 'react'; // import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Row, Col, Typography } from 'antd';
import {
  ShoppingOutlined,
  ShopOutlined,
  CarOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'; // importa los iconos que necesitas
import Card from './card'; // importa tu componente Card
import styles from './HomeSync.module.css'; 

const { Title } = Typography;

interface Module {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const HomeSync: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('conexionSeleccionada')) {
      navigate('/sync/seleccionar-conexion');
    }
  }, [navigate]);

  const iconStyle = { fontSize: 40, color: '#FFFFFF' };

  const modules: Module[] = [
    { title: 'Gestión de Productos', description: 'Administra de forma centralizada todos tus productos, puedes cargar articulos, importar desde Excel, sincronizar con WooCommerce o Mercado Libre', icon: <ShoppingOutlined style={iconStyle} />, link: '/sync/productos' },
    { title: 'Punto de Venta',          description: 'Crea y gestiona ventas de forma rápida y ordenada. Selecciona la bodega, agrega productos, asigna un cliente y genera tus notas de venta en segundos. Todo desde una interfaz simple y eficiente.', icon: <ShopOutlined     style={iconStyle} />, link: '/sync/punto-de-venta' },
    { title: 'Gestión de Envíos',       description: 'Administra y monitorea todos tus envíos desde un solo lugar. Consulta los envíos del día, revisa próximos despachos, sigue el estado de los que están en tránsito y mantén el control de los finalizados o cancelados.', icon: <CarOutlined      style={iconStyle} />, link: '/sync/envios' },
    { title: 'Otros / Configuración',   description: 'Personaliza y ajusta las opciones clave de tu sistema. Define preferencias generales, integra servicios externos y adapta la plataforma a las necesidades de tu negocio.', icon: <SettingOutlined style={iconStyle} />, link: '/sync/otros' },
    { title: 'Gestión de Usuarios',     description: 'Administra los accesos y roles dentro de la plataforma. Crea, edita o elimina usuarios, y asigna permisos para mantener el control y la seguridad de tu operación.', icon: <UserOutlined     style={iconStyle} />, link: '/sync/usuarios' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <Title level={2} className={styles.title}>
          Panel de Sincronización
        </Title>

        <Row gutter={[32, 60]} justify="center">
          {modules.map((m, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Link to={m.link}>
                <div className={styles.cardWrapper}>
                  <div className={styles.blob} />
                  <Card
                    icon={m.icon}
                    title={m.title}
                    description={m.description}
                  />
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomeSync;
