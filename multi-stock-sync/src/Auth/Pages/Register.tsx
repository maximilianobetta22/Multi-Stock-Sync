import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { LoadingDinamico } from "../../components/LoadingDinamico/LoadingDinamico"
import { Input, Button, Card, Typography, Alert, Space, Divider, Row, Col } from "antd"
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserAddOutlined,
  LoginOutlined,
  SyncOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

const formatPhoneNumber = (phone: string) => {
  if (!phone.startsWith("+")) {
    phone = `${phone}`
  }
  return phone
}

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const brandColors = {
    primary: "#FF5722",
    primaryDark: "#D84315",
    secondary: "#FF9800",
    accent: "#FFC107",
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "")
    const formattedPhone = formatPhoneNumber(input)
    setTelefono(formattedPhone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await axios.post(`${process.env.VITE_API_URL}/users`, {
        nombre,
        apellidos,
        telefono,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate("/sync/login")
    } catch (err) {
      setErrors((err as any).response?.data?.errors || {})
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
          <Row justify="center" style={{ width: "100%", maxWidth: "500px" }}>
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
                    padding: "20px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <SyncOutlined style={{ fontSize: "25px", color: "white" }} />
                  </div>

                  <Title level={4} style={{ color: "white", margin: 0, fontWeight: "bold" }}>
                    Multi Stock Sync
                  </Title>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "12px" }}>
                    Únete a la gestión inteligente
                  </Text>
                </div>

                {/* Form compacto */}
                <div style={{ padding: "25px 20px" }}>
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <Title level={4} style={{ margin: 0, color: "#333" }}>
                      Crear Cuenta
                    </Title>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Completa el formulario para comenzar
                    </Text>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      {/* Nombre y Apellidos */}
                      <Row gutter={12}>
                        <Col span={12}>
                          <Input
                            size="middle"
                            prefix={<UserOutlined style={{ color: brandColors.primary }} />}
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            status={errors.nombre ? "error" : ""}
                            style={{ borderRadius: "8px" }}
                          />
                          {errors.nombre && (
                            <Text type="danger" style={{ fontSize: "10px" }}>
                              {errors.nombre[0]}
                            </Text>
                          )}
                        </Col>
                        <Col span={12}>
                          <Input
                            size="middle"
                            prefix={<TeamOutlined style={{ color: brandColors.primary }} />}
                            placeholder="Apellidos"
                            value={apellidos}
                            onChange={(e) => setApellidos(e.target.value)}
                            required
                            status={errors.apellidos ? "error" : ""}
                            style={{ borderRadius: "8px" }}
                          />
                          {errors.apellidos && (
                            <Text type="danger" style={{ fontSize: "10px" }}>
                              {errors.apellidos[0]}
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {/* Teléfono */}
                      <div>
                        <Input
                          size="middle"
                          prefix={<PhoneOutlined style={{ color: brandColors.primary }} />}
                          addonBefore="+"
                          placeholder="56999999999"
                          value={telefono}
                          onChange={handlePhoneChange}
                          maxLength={11}
                          required
                          status={errors.telefono ? "error" : ""}
                          style={{ borderRadius: "8px" }}
                        />
                        {errors.telefono && (
                          <Text type="danger" style={{ fontSize: "10px" }}>
                            {errors.telefono[0]}
                          </Text>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Input
                          size="middle"
                          type="email"
                          prefix={<MailOutlined style={{ color: brandColors.primary }} />}
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          status={errors.email ? "error" : ""}
                          style={{ borderRadius: "8px" }}
                        />
                        {errors.email && (
                          <Text type="danger" style={{ fontSize: "10px" }}>
                            {errors.email[0]}
                          </Text>
                        )}
                      </div>

                      {/* Contraseñas */}
                      <Row gutter={12}>
                        <Col span={12}>
                          <Input.Password
                            size="middle"
                            prefix={<LockOutlined style={{ color: brandColors.primary }} />}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            status={errors.password ? "error" : ""}
                            style={{ borderRadius: "8px" }}
                          />
                          {errors.password && (
                            <Text type="danger" style={{ fontSize: "10px" }}>
                              {errors.password[0]}
                            </Text>
                          )}
                        </Col>
                        <Col span={12}>
                          <Input.Password
                            size="middle"
                            prefix={<LockOutlined style={{ color: brandColors.primary }} />}
                            placeholder="Confirmar"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            status={errors.password_confirmation ? "error" : ""}
                            style={{ borderRadius: "8px" }}
                          />
                          {errors.password_confirmation && (
                            <Text type="danger" style={{ fontSize: "10px" }}>
                              {errors.password_confirmation[0]}
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {Object.keys(errors).length > 0 && (
                        <Alert
                          message="Revisa los campos marcados"
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
                        icon={<UserAddOutlined />}
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
                        Crear Cuenta
                      </Button>

                      <Divider style={{ margin: "15px 0", fontSize: "11px" }}>¿Ya tienes cuenta?</Divider>

                      <Link to="/sync/login" style={{ textDecoration: "none" }}>
                        <Button
                          type="default"
                          size="large"
                          icon={<LoginOutlined />}
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
                          Iniciar Sesión
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

export default Register
