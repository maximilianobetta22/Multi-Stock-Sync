import type React from "react"
import { useState, useContext } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { LoadingDinamico } from "../../components/LoadingDinamico/LoadingDinamico"
import { UserContext } from "../../Sync/Context/UserContext"
import { Input, Button, Card, Typography, Alert, Space, Divider, Row, Col } from "antd"
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const brandColors = {
    primary: "rgb(0, 58, 142)",
    primaryDark: "#D84315",
    secondary: "#6e75b4",
    accent: "#FFC107",
  }

  const userContext = useContext(UserContext)
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider")
  }
  const { setUser } = userContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/login`, { email, password })
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("role", JSON.stringify(response.data.role))
      setUser(response.data.user)
      navigate("/sync/seleccionar-conexion")
    } catch (err) {
      setError((err as any).response?.data?.message || "Credenciales inválidas")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div
          style={{
            minHeight: "100vh",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Elementos animados de fondo */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${brandColors.primary}15 0%, ${brandColors.primary}05 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "-30px",
              width: "150px",
              height: "150px",
              background: `radial-gradient(circle, ${brandColors.secondary}20 0%, ${brandColors.secondary}08 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "10%",
              width: "120px",
              height: "120px",
              background: `radial-gradient(circle, ${brandColors.accent}18 0%, ${brandColors.accent}06 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 7s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "20%",
              width: "180px",
              height: "180px",
              background: `radial-gradient(circle, ${brandColors.primary}12 0%, ${brandColors.primary}04 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 9s ease-in-out infinite reverse",
            }}
          />

          {/* Ondas animadas */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${brandColors.primary}02 0%, transparent 25%, ${brandColors.secondary}03 50%, transparent 75%, ${brandColors.accent}02 100%)`,
              animation: "wave 12s ease-in-out infinite",
            }}
          />

          {/* Partículas flotantes */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "15%",
              width: "8px",
              height: "8px",
              background: brandColors.primary,
              borderRadius: "50%",
              opacity: 0.3,
              animation: "particle 10s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "60%",
              right: "25%",
              width: "6px",
              height: "6px",
              background: brandColors.secondary,
              borderRadius: "50%",
              opacity: 0.4,
              animation: "particle 15s linear infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "30%",
              left: "70%",
              width: "10px",
              height: "10px",
              background: brandColors.accent,
              borderRadius: "50%",
              opacity: 0.2,
              animation: "particle 12s linear infinite",
            }}
          />

          <Row justify="center" style={{ width: "100%", maxWidth: "400px", zIndex: 1 }}>
            <Col span={24}>
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(255, 87, 34, 0.15)",
                  border: "none",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.95)",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header compacto */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                    padding: "25px 20px",
                    textAlign: "center",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 15px",
                    }}
                  >
                    <img
                      src="/assets/img/logo/Crazy_logo_bordes.png"
                      alt="Icono"
                      style={{ width: "100px", height: "100px", objectFit: "contain" }}
                    />
                  </div>

                  <Title level={3} style={{ color: "white", margin: 0, fontWeight: "bold" }}>
                    Software de Gestión
                  </Title>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "13px" }}>
                    De Inventario Multi-Plataforma
                  </Text>

                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      WooCommerce
                    </div>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      MercadoLibre
                    </div>
                  </div>
                </div>

                {/* Form compacto */}
                <div style={{ padding: "25px 20px" }}>
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <Title level={4} style={{ margin: 0, color: "#333" }}>
                      Iniciar Sesión
                    </Title>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Accede a tu panel de control
                    </Text>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div>
                        <Input
                          size="large"
                          prefix={<UserOutlined style={{ color: brandColors.primary }} />}
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{ borderRadius: "8px" }}
                        />
                      </div>

                      <div>
                        <Input.Password
                          size="large"
                          prefix={<LockOutlined style={{ color: brandColors.primary }} />}
                          placeholder="Contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          style={{ borderRadius: "8px" }}
                        />
                      </div>

                      {error && (
                        <Alert
                          message={error}
                          type="error"
                          showIcon
                          style={{ borderRadius: "8px", fontSize: "12px" }}
                        />
                      )}

                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        icon={<LoginOutlined />}
                        style={{
                          width: "100%",
                          height: "45px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                          border: "none",
                        }}
                      >
                        Acceder
                      </Button>

                      <Divider style={{ margin: "15px 0", fontSize: "11px" }}>¿No tienes cuenta?</Divider>

                      <Link to="/sync/register" style={{ textDecoration: "none" }}>
                        <Button
                          type="default"
                          size="large"
                          icon={<UserAddOutlined />}
                          style={{
                            width: "100%",
                            height: "45px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            border: `2px solid ${brandColors.primary}`,
                            color: brandColors.primary,
                          }}
                          ghost
                        >
                          Crear Cuenta
                        </Button>
                      </Link>
                    </Space>
                  </form>
                </div>

                {/* Footer compacto */}
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "12px 20px",
                    textAlign: "center",
                    borderTop: "1px solid #e9ecef",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: "10px" }}>
                    © 2024 Software de Gestión Crazy Family
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Estilos CSS para las animaciones */}
          <style>
            {`
              @keyframes float {
                0%, 100% { 
                  transform: translateY(0px) translateX(0px) scale(1);
                  opacity: 0.7;
                }
                33% { 
                  transform: translateY(-20px) translateX(10px) scale(1.1);
                  opacity: 0.4;
                }
                66% { 
                  transform: translateY(10px) translateX(-15px) scale(0.9);
                  opacity: 0.6;
                }
              }

              @keyframes wave {
                0%, 100% { 
                  transform: translateX(0%) rotate(0deg);
                  opacity: 0.3;
                }
                25% { 
                  transform: translateX(5%) rotate(1deg);
                  opacity: 0.5;
                }
                50% { 
                  transform: translateX(-3%) rotate(-1deg);
                  opacity: 0.2;
                }
                75% { 
                  transform: translateX(2%) rotate(0.5deg);
                  opacity: 0.4;
                }
              }

              @keyframes particle {
                0% { 
                  transform: translateY(0px) translateX(0px);
                  opacity: 0;
                }
                10% { 
                  opacity: 1;
                }
                90% { 
                  opacity: 1;
                }
                100% { 
                  transform: translateY(-100vh) translateX(50px);
                  opacity: 0;
                }
              }
            `}
          </style>
        </div>
      )}
    </>
  )
}
