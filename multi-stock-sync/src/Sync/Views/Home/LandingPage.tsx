import type React from "react"
import { Button, Card, Typography, Row, Col, Space, Divider } from "antd"
import { Link } from "react-router-dom"
import {
  SyncOutlined,
  ShopOutlined,
  LinkOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  SmileOutlined,
  PlayCircleOutlined,
  CoffeeOutlined,
  HomeOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography

const LandingPage: React.FC = () => {
  const brandColors = {
    primary: "#6c3baa",
    primaryDark: "#D84315",
    secondary: "#cf1020",
    accent: "#FFC107",
  }

  const features = [
    {
      icon: <SyncOutlined style={{ fontSize: "40px", color: brandColors.primary }} />,
      title: "Sincronización Simple",
      description: "Mantén tu inventario actualizado automáticamente. Sin complicaciones técnicas.",
    },
    {
      icon: <LinkOutlined style={{ fontSize: "40px", color: brandColors.primary }} />,
      title: "Conecta Tus Tiendas",
      description: "WooCommerce, MercadoLibre y más. Todo desde un lugar fácil de usar.",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: "40px", color: brandColors.primary }} />,
      title: "Reportes Claros",
      description: "Ve cómo van tus ventas con gráficos simples que realmente entiendes.",
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: "40px", color: brandColors.primary }} />,
      title: "Tranquilidad Total",
      description: "Tus datos están seguros. Nosotros nos encargamos de la parte técnica.",
    },
  ]

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div style={{ padding: "80px 20px", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row align="middle" gutter={[48, 48]}>
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                  <Title
                    level={1}
                    style={{ fontSize: "48px", fontWeight: "bold", color: "#333", marginBottom: "20px" }}
                  >
                    Gestiona tu{" "}
                    <span style={{ color: brandColors.primary, position: "relative" }}>
                      inventario
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-5px",
                          left: 0,
                          right: 0,
                          height: "4px",
                          background: brandColors.secondary,
                          borderRadius: "2px",
                        }}
                      />
                    </span>{" "}
                    sin complicaciones
                  </Title>
                  <Paragraph style={{ fontSize: "20px", color: "#666", lineHeight: "1.6" }}>
                    Si tienes una tienda online o vendes en varias plataformas, el Software de Gestión de Crazy Family te ayudara mantener
                    todo organizado automáticamente. Sin dolores de cabeza, sin errores.
                  </Paragraph>
                </div>

                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <Link to="/sync/register">
                    <Button
                      type="primary"
                      size="large"
                      icon={<HeartOutlined />}
                      style={{
                        height: "50px",
                        padding: "0 30px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        background: brandColors.primary,
                        border: "none",
                        borderRadius: "8px",
                      }}
                    >
                      Probarlo Gratis
                    </Button>
                  </Link>
                  <Button
                    type="default"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    style={{
                      height: "50px",
                      padding: "0 30px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      border: `2px solid ${brandColors.primary}`,
                      color: brandColors.primary,
                    }}
                  >
                    Ver Cómo Funciona
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
                  <div style={{ textAlign: "center" }}>
                    <Title level={3} style={{ color: brandColors.primary, margin: 0 }}>
                      <SmileOutlined />
                    </Title>
                    <Text type="secondary">Fácil de usar</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Title level={3} style={{ color: brandColors.primary, margin: 0 }}>
                      <CoffeeOutlined />
                    </Title>
                    <Text type="secondary">5 min setup</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Title level={3} style={{ color: brandColors.primary, margin: 0 }}>
                      <HomeOutlined />
                    </Title>
                    <Text type="secondary">Desde casa</Text>
                  </div>
                </div>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${brandColors.primary}10 0%, ${brandColors.secondary}10 100%)`,
                  borderRadius: "20px",
                  padding: "40px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Elementos decorativos más amigables */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: brandColors.primary,
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  <ShopOutlined style={{ fontSize: "30px", color: "white" }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    background: brandColors.secondary,
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "float 3s ease-in-out infinite reverse",
                  }}
                >
                  <HeartOutlined style={{ fontSize: "25px", color: "white" }} />
                </div>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      background: "white",
                      borderRadius: "50%",
                      width: "120px",
                      height: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 30px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  >
                    <SyncOutlined
                      style={{
                        fontSize: "60px",
                        color: brandColors.primary,
                        animation: "spin 4s linear infinite",
                      }}
                    />
                  </div>
                  <Title level={3} style={{ color: "#333" }}>
                    Todo en un Solo Lugar
                  </Title>
                  <Text style={{ color: "#666" }}>
                    Una interfaz simple donde puedes ver y controlar todas tus tiendas.
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "80px 20px", background: "#fafafa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Title level={2} style={{ color: "#333", marginBottom: "20px" }}>
              ¿Qué hace el Software de Gestión Crazy Family por ti?
            </Title>
            <Paragraph style={{ fontSize: "18px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
              Te ayudamos a que tu negocio funcione solo, para que puedas enfocarte en lo que realmente importa.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  style={{
                    height: "100%",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: "30px 20px", textAlign: "center" }}
                  hoverable
                >
                  <div style={{ marginBottom: "20px" }}>{feature.icon}</div>
                  <Title level={4} style={{ color: "#333", marginBottom: "15px" }}>
                    {feature.title}
                  </Title>
                  <Text style={{ color: "#666", lineHeight: "1.6" }}>{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
      {/* Footer */}
      <div style={{ padding: "40px 20px", background: "#333", color: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="middle">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      background: brandColors.primary,
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SyncOutlined style={{ fontSize: "20px", color: "white" }} />
                  </div>
                  <Title level={4} style={{ color: "white", margin: 0 }}>
                    Software de Gestion
                  </Title>
                </div>
                <Text style={{ color: "#ccc" }}>
                  La forma más fácil de manejar tu inventario. Hecho para personas reales con vidas ocupadas.
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="middle">
                <Title level={5} style={{ color: "white" }}>
                  Ayuda
                </Title>
                <Space direction="vertical" size="small">
                  <Text style={{ color: "#ccc" }}>Cómo empezar</Text>
                  <Text style={{ color: "#ccc" }}>Preguntas frecuentes</Text>
                  <Text style={{ color: "#ccc" }}>Contacto</Text>
                  <Text style={{ color: "#ccc" }}>Tutoriales</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="middle">
                <Title level={5} style={{ color: "white" }}>
                  Conecta con nosotros
                </Title>
                <Space direction="vertical" size="small">
                  <Text style={{ color: "#ccc" }}>WhatsApp</Text>
                  <Text style={{ color: "#ccc" }}>Email</Text>
                  <Text style={{ color: "#ccc" }}>Facebook</Text>
                  <Text style={{ color: "#ccc" }}>Instagram</Text>
                </Space>
              </Space>
            </Col>
          </Row>
          <Divider style={{ borderColor: "#555", margin: "40px 0 20px" }} />
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#999" }}>© 2024 Software de Gestión Crazy Family. Hecho con amor para emprendedores como tú.</Text>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default LandingPage
