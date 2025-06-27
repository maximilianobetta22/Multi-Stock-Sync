// src/pages/HomeSync.tsx
import React, { useEffect } from 'react'; // import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Row, Col, Typography } from 'antd';
import {
  ShoppingOutlined,
  ShopOutlined,
  CarOutlined,
  SettingOutlined,
} from '@ant-design/icons'; // importa los iconos que necesitas
import Card from './card'; // importa tu componente Card
import styles from './HomeSync.module.css'; 

const { Title } = Typography;


const HomeSync: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('conexionSeleccionada')) {
      navigate('/sync/seleccionar-conexion');
    }
  }, [navigate]);

  const modules = [
    {
      title: "Gestión de Productos",
      description: "Administra productos, stock y cargas masivas.",
      icon: <ShoppingOutlined style={{ fontSize: "40px" }} />,
      link: "/sync/productos",
    },
    {
      title: "Punto de Venta / Notas de Venta",
      description: "Genera notas de venta, facturas y administra clientes.",
      icon: <ShopOutlined style={{ fontSize: "40px" }} />,
      link: "/sync/punto-de-venta",
    },
    {
      title: "Gestión de Envíos",
      description: "Controla los pedidos, despachos y estados de envío.",
      icon: <CarOutlined style={{ fontSize: "40px" }} />,
      link: "/sync/envios",
    },
    {
      title: "Otros / Configuración",
      description: "Reportes, conexiones, ajustes del sistema y soporte.",
      icon: <SettingOutlined style={{ fontSize: "40px" }} />,
      link: "/sync/otros",
    },
    {
      title: "Gestión de Usuarios",
      description: "Administra los usuarios del sistema y sus roles.",
      icon: <SettingOutlined style={{ fontSize: "40px" }} />,
      link: "/sync/Gestion-usuarios", 
    },
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
