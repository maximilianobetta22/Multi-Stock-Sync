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
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

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

  // Paleta consistente con Login
  const brand = {
    primary: "rgb(0,58,142)",
    secondary: "#4D5BD1",
    ink: "#111827",
    light: "#f8fafc",
    border: "#e2e8f0",
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y limitar a 8 dígitos después de +56 9
    const input = e.target.value.replace(/\D/g, "")
    if (input.length <= 8) {
      setTelefono(input)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Formatear teléfono completo para enviar al backend
      const telefonoCompleto = `+569${telefono}`

      // 1. REGISTRAR USUARIO
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, {
        nombre,
        apellidos,
        telefono: telefonoCompleto,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      if (response.data.user) {
        console.log('Usuario creado:', response.data.user.email)

        // 2. HACER LOGIN AUTOMÁTICO
        console.log('Haciendo login automático...')

        const loginResponse = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
          email,
          password
        })

        // 3. GUARDAR DATOS DEL LOGIN
        if (loginResponse.data.token) {
          localStorage.setItem("token", loginResponse.data.token)
          localStorage.setItem("user", JSON.stringify(loginResponse.data.user))
          if (loginResponse.data.role) {
            localStorage.setItem("role", JSON.stringify(loginResponse.data.role))
          }
        }

        // 4. REDIRIGIR A PÁGINA DE VERIFICACIÓN
        navigate("/sync/verify-email")

      } else {
        console.error('Error: No se recibió información del usuario')
        setErrors({ general: ['Error al crear el usuario'] })
      }

    } catch (err: any) {
      console.error('Error en registro/login:', err)

      // Si falla el login automático pero el registro fue exitoso
      if (err.response?.status === 422 && err.config?.url?.includes('/login')) {
        navigate("/sync/login?message=registro-exitoso")
      } else {
        setErrors(err.response?.data?.errors || { general: ['Error de conexión'] })
      }
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
            {/* Tamaño adaptado para más campos */}
            <Col xs={24} sm={22} md={20} lg={16} xl={12} xxl={10}>
              <Card
                style={{
                  borderRadius: 16,
                  border: `1px solid ${brand.border}`,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  maxWidth: 520,
                  margin: "0 auto",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header */}
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

                  <Title
                    level={3}
                    style={{ color: "#fff", margin: "0 0 4px 0", fontWeight: 700, textAlign: "center" }}
                  >
                    Software de Gestión
                  </Title>
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, textAlign: "center" }}
                  >
                    Únete a la gestión inteligente
                  </Text>

                </div>

                {/* Formulario */}
                <div style={{ padding: "28px 32px" }}>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Title level={4} style={{ margin: "0 0 4px 0", color: brand.ink, fontSize: 18 }}>
                      Crear Cuenta
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Completa el formulario para comenzar
                    </Text>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      {/* Nombre y Apellidos */}
                      <Row gutter={12}>
                        <Col span={12}>
                          <Input
                            size="large"
                            prefix={<UserOutlined style={{ color: brand.primary }} />}
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            status={errors.nombre ? "error" : ""}
                            style={{
                              borderRadius: 8,
                              height: 44,
                              border: `1px solid ${brand.border}`,
                            }}
                          />
                          {errors.nombre && (
                            <Text type="danger" style={{ fontSize: 11 }}>
                              {errors.nombre[0]}
                            </Text>
                          )}
                        </Col>
                        <Col span={12}>
                          <Input
                            size="large"
                            prefix={<TeamOutlined style={{ color: brand.primary }} />}
                            placeholder="Apellidos"
                            value={apellidos}
                            onChange={(e) => setApellidos(e.target.value)}
                            required
                            status={errors.apellidos ? "error" : ""}
                            style={{
                              borderRadius: 8,
                              height: 44,
                              border: `1px solid ${brand.border}`,
                            }}
                          />
                          {errors.apellidos && (
                            <Text type="danger" style={{ fontSize: 11 }}>
                              {errors.apellidos[0]}
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {/* Teléfono con formato +56 9 */}
                      <div>
                        <Input
                          size="large"
                          prefix={<PhoneOutlined style={{ color: brand.primary }} />}
                          addonBefore="+56 9"
                          placeholder="ingresa tu numero de teléfono"
                          value={telefono}
                          onChange={handlePhoneChange}
                          maxLength={8}
                          required
                          status={errors.telefono ? "error" : ""}
                          style={{
                            borderRadius: 8,
                            height: 44,
                           
                          }}
                        />
                        {errors.telefono && (
                          <Text type="danger" style={{ fontSize: 11 }}>
                            {errors.telefono[0]}
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Ingresa 8 dígitos del número móvil
                        </Text>
                      </div>

                      {/* Email */}
                      <div>
                        <Input
                          size="large"
                          type="email"
                          prefix={<MailOutlined style={{ color: brand.primary }} />}
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          status={errors.email ? "error" : ""}
                          style={{
                            borderRadius: 8,
                            height: 44,
                            border: `1px solid ${brand.border}`,
                          }}
                        />
                        {errors.email && (
                          <Text type="danger" style={{ fontSize: 11 }}>
                            {errors.email[0]}
                          </Text>
                        )}
                      </div>

                      {/* Contraseñas */}
                      <Row gutter={12}>
                        <Col span={12}>
                          <Input.Password
                            size="large"
                            prefix={<LockOutlined style={{ color: brand.primary }} />}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            status={errors.password ? "error" : ""}
                            style={{
                              borderRadius: 8,
                              height: 44,
                              border: `1px solid ${brand.border}`,
                            }}
                          />
                          {errors.password && (
                            <Text type="danger" style={{ fontSize: 11 }}>
                              {errors.password[0]}
                            </Text>
                          )}
                        </Col>
                        <Col span={12}>
                          <Input.Password
                            size="large"
                            prefix={<LockOutlined style={{ color: brand.primary }} />}
                            placeholder="Confirmar"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            status={errors.password_confirmation ? "error" : ""}
                            style={{
                              borderRadius: 8,
                              height: 44,
                              border: `1px solid ${brand.border}`,
                            }}
                          />
                          {errors.password_confirmation && (
                            <Text type="danger" style={{ fontSize: 11 }}>
                              {errors.password_confirmation[0]}
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {/* Error general */}
                      {Object.keys(errors).length > 0 && !errors.nombre && !errors.apellidos && !errors.telefono && !errors.email && !errors.password && !errors.password_confirmation && (
                        <Alert
                          message="Revisa los campos marcados"
                          type="error"
                          showIcon
                          style={{ borderRadius: 8, fontSize: 13 }}
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
                        Crear Cuenta
                      </Button>

                      <Divider plain style={{ margin: "12px 0 8px", fontSize: 13 }}>
                        ¿Ya tienes cuenta?
                      </Divider>

                      <Link to="/sync/login" style={{ textDecoration: "none" }}>
                        <Button
                          size="large"
                          icon={<LoginOutlined />}
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
                          Iniciar Sesión
                        </Button>
                      </Link>
                    </Space>
                  </form>
                </div>

                {/* Footer */}
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

export default Register