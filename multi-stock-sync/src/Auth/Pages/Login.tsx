import type React from "react"
import { useState, useContext } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
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

  // Paleta simplificada
  const brand = {
    primary: "rgb(0,58,142)",
    secondary: "#4D5BD1",
    ink: "#111827",
    light: "#f8fafc",
    border: "#e2e8f0",
  }

  const userContext = useContext(UserContext)
  if (!userContext) throw new Error("UserContext must be used within a UserProvider")
  const { setUser } = userContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const base =
        (import.meta as any)?.env?.VITE_API_URL ??
        (process as any)?.env?.VITE_API_URL ??
        ""
      const { data } = await axios.post(`${base}/login`, { email, password })
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("role", JSON.stringify(data.role))
      setUser(data.user)
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
            background: brand.light,
          }}
        >
          <Row justify="center" style={{ width: "100%" }}>
            {/* Tamaño más amplio */}
            <Col xs={24} sm={22} md={18} lg={14} xl={10} xxl={8}>
              <Card
                style={{
                  borderRadius: 16,
                  border: `1px solid ${brand.border}`,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header más compacto */}
                <div
                  style={{
                    background: brand.primary,
                    padding: "24px 20px 20px",
                    textAlign: "center",
                    position: "relative",
                    // Patrón de puntos en el fondo azul
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "15px 15px",
                  }}
                >
                  {/* Logo */}
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      margin: "0 auto 16px",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src="/assets/img/logo/logo_mejorado.png"
                      alt="Crazy Family"
                      style={{
                        maxWidth: "140%",
                        maxHeight: "140%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>


                  <Title level={3} style={{ color: "#fff", margin: "0 0 4px 0", fontWeight: 700 }}>
                    Software de Gestión
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
                    De Inventario Multi-Plataforma
                  </Text>

                  {/* Tags más pequeños */}
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                    >
                      WooCommerce
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                    >
                      MercadoLibre
                    </span>
                  </div>
                </div>

                {/* Formulario con más espacio */}
                <div style={{ padding: "28px 36px" }}>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <Title level={4} style={{ margin: "0 0 4px 0", color: brand.ink, fontSize: 18 }}>
                      Iniciar Sesión
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Accede a tu panel de control
                    </Text>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <Input
                        size="large"
                        prefix={<UserOutlined style={{ color: brand.primary }} />}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          borderRadius: 8,
                          height: 44,
                          border: `1px solid ${brand.border}`,
                        }}
                      />

                      <Input.Password
                        size="large"
                        prefix={<LockOutlined style={{ color: brand.primary }} />}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        style={{
                          borderRadius: 8,
                          height: 44,
                          border: `1px solid ${brand.border}`,
                        }}
                      />

                      {error && (
                        <Alert
                          message={error}
                          type="error"
                          showIcon
                          style={{ borderRadius: 8, fontSize: 13 }}
                        />
                      )}

                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        icon={<LoginOutlined />}
                        style={{
                          width: "100%",
                          height: 46,
                          borderRadius: 8,
                          fontWeight: 600,
                          background: brand.primary,
                          borderColor: brand.primary,
                          marginTop: 8,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = brand.secondary
                          e.currentTarget.style.borderColor = brand.secondary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = brand.primary
                          e.currentTarget.style.borderColor = brand.primary
                        }}
                      >
                        Acceder
                      </Button>

                      <Divider plain style={{ margin: "12px 0 8px", fontSize: 13 }}>
                        ¿No tienes cuenta?
                      </Divider>

                      <Link to="/sync/register" style={{ textDecoration: "none" }}>
                        <Button
                          size="large"
                          icon={<UserAddOutlined />}
                          style={{
                            width: "100%",
                            height: 46,
                            borderRadius: 8,
                            fontWeight: 600,
                            border: `1px solid ${brand.primary}`,
                            color: brand.primary,
                            background: "#fff",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = brand.primary
                            e.currentTarget.style.color = "#fff"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff"
                            e.currentTarget.style.color = brand.primary
                          }}
                        >
                          Crear Cuenta
                        </Button>
                      </Link>
                    </Space>
                  </form>
                </div>

                {/* Footer más sutil */}
                <div
                  style={{
                    background: "#fafbfc",
                    padding: "16px 24px",
                    textAlign: "center",
                    borderTop: `1px solid ${brand.border}`,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    © 2024 Software de Gestión Crazy Family
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