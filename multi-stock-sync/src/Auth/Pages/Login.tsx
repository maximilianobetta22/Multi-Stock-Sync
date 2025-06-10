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
  SyncOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const brandColors = {
    primary: "#FF5722",
    primaryDark: "#D84315",
    secondary: "#FF9800",
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
            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
          }}
        >
          <Row justify="center" style={{ width: "100%", maxWidth: "400px" }}>
            <Col span={24}>
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                  border: "none",
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header compacto */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
                    padding: "25px 20px",
                    textAlign: "center",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "60px",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 15px",
                    }}
                  >
                    <SyncOutlined style={{ fontSize: "30px", color: "white" }} />
                  </div>

                  <Title level={3} style={{ color: "white", margin: 0, fontWeight: "bold" }}>
                    Multi Stock Sync
                  </Title>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "13px" }}>
                    Gestión de Inventario Multi-Plataforma
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
                    © 2024 Multi Stock Sync
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </>
  )
}
