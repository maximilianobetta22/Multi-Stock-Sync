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
    primary: "rgb(0, 58, 142)",
    primaryDark: "#D84315",
    secondary:"#6e75b4",
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
      
      // 1. REGISTRAR USUARIO
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, {
        nombre,
        apellidos,
        telefono,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })


      if (response.data.user) {
        console.log(' Usuario creado:', response.data.user.email) // Debug
        
        // 2. HACER LOGIN AUTOMÁTICO (para tener token)
        console.log(' Haciendo login automático...') // Debug
        
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
        console.error(' Error: No se recibió información del usuario')
        setErrors({ general: ['Error al crear el usuario'] })
      }
      
    } catch (err: any) {
      console.error(' Error en registro/login:', err) // Debug
      
      // Si falla el login automático pero el registro fue exitoso
      if (err.response?.status === 422 && err.config?.url?.includes('/login')) {
        // Redirigir al login manual
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
              top: "-80px",
              left: "-80px",
              width: "250px",
              height: "250px",
              background: `radial-gradient(circle, ${brandColors.primary}18 0%, ${brandColors.primary}06 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 7s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "15%",
              right: "-60px",
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${brandColors.secondary}22 0%, ${brandColors.secondary}08 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 9s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "5%",
              width: "180px",
              height: "180px",
              background: `radial-gradient(circle, ${brandColors.accent}20 0%, ${brandColors.accent}07 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              right: "15%",
              width: "220px",
              height: "220px",
              background: `radial-gradient(circle, ${brandColors.primary}14 0%, ${brandColors.primary}05 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 10s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "-40px",
              width: "160px",
              height: "160px",
              background: `radial-gradient(circle, ${brandColors.secondary}16 0%, ${brandColors.secondary}04 70%, transparent 100%)`,
              borderRadius: "50%",
              animation: "float 6s ease-in-out infinite",
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
              background: `linear-gradient(60deg, ${brandColors.primary}03 0%, transparent 20%, ${brandColors.secondary}04 40%, transparent 60%, ${brandColors.accent}03 80%, transparent 100%)`,
              animation: "wave 15s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(-45deg, transparent 0%, ${brandColors.primary}02 25%, transparent 50%, ${brandColors.secondary}02 75%, transparent 100%)`,
              animation: "wave 18s ease-in-out infinite reverse",
            }}
          />

          {/* Más partículas flotantes */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "20%",
              width: "8px",
              height: "8px",
              background: brandColors.primary,
              borderRadius: "50%",
              opacity: 0.4,
              animation: "particle 12s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "70%",
              right: "30%",
              width: "6px",
              height: "6px",
              background: brandColors.secondary,
              borderRadius: "50%",
              opacity: 0.3,
              animation: "particle 16s linear infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40%",
              left: "80%",
              width: "10px",
              height: "10px",
              background: brandColors.accent,
              borderRadius: "50%",
              opacity: 0.5,
              animation: "particle 14s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              right: "10%",
              width: "7px",
              height: "7px",
              background: brandColors.primary,
              borderRadius: "50%",
              opacity: 0.3,
              animation: "particle 11s linear infinite reverse",
            }}
          />

          <Row justify="center" style={{ width: "100%", maxWidth: "500px", zIndex: 1 }}>
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
                    padding: "20px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <img
                      src="/assets/img/logo/Crazy_logo_bordes.png"
                      alt="Icono"
                      style={{ width: "100px", height: "100px", objectFit: "contain" }}
                    />
                  </div>

                  <Title level={4} style={{ color: "white", margin: 0, fontWeight: "bold" }}>
                    Software de Gestión
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
                  opacity: 0.6;
                }
                25% { 
                  transform: translateY(-25px) translateX(15px) scale(1.05);
                  opacity: 0.3;
                }
                50% { 
                  transform: translateY(15px) translateX(-20px) scale(0.95);
                  opacity: 0.7;
                }
                75% { 
                  transform: translateY(-10px) translateX(10px) scale(1.02);
                  opacity: 0.4;
                }
              }

              @keyframes wave {
                0%, 100% { 
                  transform: translateX(0%) rotate(0deg) scale(1);
                  opacity: 0.2;
                }
                20% { 
                  transform: translateX(8%) rotate(2deg) scale(1.1);
                  opacity: 0.4;
                }
                40% { 
                  transform: translateX(-5%) rotate(-1deg) scale(0.9);
                  opacity: 0.1;
                }
                60% { 
                  transform: translateX(3%) rotate(1.5deg) scale(1.05);
                  opacity: 0.3;
                }
                80% { 
                  transform: translateX(-2%) rotate(-0.5deg) scale(0.95);
                  opacity: 0.5;
                }
              }

              @keyframes particle {
                0% { 
                  transform: translateY(0px) translateX(0px) scale(0);
                  opacity: 0;
                }
                10% { 
                  opacity: 1;
                  transform: scale(1);
                }
                50% { 
                  transform: translateY(-50vh) translateX(25px) scale(1.2);
                  opacity: 0.8;
                }
                90% { 
                  opacity: 0.3;
                  transform: scale(0.8);
                }
                100% { 
                  transform: translateY(-100vh) translateX(60px) scale(0);
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

export default Register