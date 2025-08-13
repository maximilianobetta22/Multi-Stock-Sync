import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../../Context/UserContext"
import StockCriticAlert from "../../stockCriticAlert"
import { Button, Avatar, Dropdown, Space } from "antd"
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"

const Navbar = () => {
  const userContext = useContext(UserContext)
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider")
  }
  const { user, setUser } = userContext
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/sync/logout")
    setUser(null)
  }

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate('/sync/perfil'),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Configuración",
      onClick: () => navigate('/sync/configuracion'),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
    },
  ]

  const navbarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "rgb(0, 58, 142)",
    boxShadow: "0 4px 20px rgba(255, 87, 34, 0.3)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 1000,
    padding: "0",
    height: "70px",
    overflow: "hidden", // Para contener los puntos
  }

  const dotsContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    pointerEvents: "none",
    zIndex: 1,
  }

  const dotStyle: React.CSSProperties = {
    position: "absolute",
    width: "3px",
    height: "3px",
    backgroundColor: "white",
    borderRadius: "50%",
  }

  // Generar posiciones aleatorias para los puntos
  const generateDots = () => {
    const dots = []
    const numberOfDots = 40 // Reducido para que sea más sutil
    
    for (let i = 0; i < numberOfDots; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const delay = Math.random() * 4
      
      dots.push(
        <div
          key={i}
          style={{
            ...dotStyle,
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
          }}
          className="navbar-dot"
        />
      )
    }
    return dots
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    position: "relative",
    zIndex: 2, // Por encima de los puntos
  }

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }

  const logoImageStyle: React.CSSProperties = {
    height: "55px",
    width: "auto",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    transition: "all 0.3s ease",
  }

  const brandTextStyle: React.CSSProperties = {
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    display: "none", // Oculto por defecto, se muestra en pantallas grandes
  }

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }

  const userInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
  }

  const buttonStyle: React.CSSProperties = {
    borderRadius: "8px",
    height: "40px",
    fontWeight: "600",
    fontSize: "14px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 0, 0, 0.8)",
    color: "white",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  }

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "rgba(255, 0, 0, 0.8)",
    border: "2px solid rgba(255, 255, 255, 0.4)",
  }

  return (
    <nav style={navbarStyle}>
      {/* Contenedor de puntos decorativos */}
      <div style={dotsContainerStyle}>
        {generateDots()}
      </div>

      <div style={containerStyle}>
        {/* Logo Section */}
        <Link to="/sync/home" style={{ textDecoration: "none" }}>
          <div style={logoContainerStyle}>
            <img
              src="/assets/img/logo/Software_de_Gestion.png"
              alt="Software de Gestion"
              style={logoImageStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)"
                e.currentTarget.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.filter = "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
              }}
            />
            <span style={brandTextStyle}>Multi Stock Sync</span>
          </div>
        </Link>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          {user ? (
            <>
              {/* User Info */}
              <div style={userInfoStyle}>
                <StockCriticAlert />
                <span style={{ display: "none" }}>
                  {user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1)}{" "}
                  {user.apellidos.charAt(0).toUpperCase() + user.apellidos.slice(1)}
                </span>
              </div>

              {/* User Dropdown */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                  <Avatar
                    style={{
                      backgroundColor: "rgba(255, 0, 0, 0.2)",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    icon={<UserOutlined />}
                  >
                    {user.nombre.charAt(0).toUpperCase()}
                  </Avatar>
                  <span
                    style={{
                      color: "white",
                      fontWeight: "500",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1)}
                  </span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Space size="middle">
              <Link to="/sync/login">
                <Button
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(88, 0, 99, 0.82)"
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgb(0, 0, 0)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 0, 0, 0.8)"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/sync/register">
                <Button
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(88, 0, 99, 0.82)"
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgb(0, 0, 0)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 0, 0, 0.8)"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  Registrarse
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </div>

      {/* Responsive Styles + Animación de puntos */}
      <style>{`
        @keyframes navbar-twinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.3; 
            transform: scale(1.5); 
          }
        }
        
        .navbar-dot {
          animation: navbar-twinkle 4s infinite ease-in-out;
        }
        
        @media (min-width: 768px) {
          .brand-text {
            display: block !important;
          }
          .user-name {
            display: inline !important;
          }
        }
        
        @media (max-width: 767px) {
          .navbar-container {
            padding: 0 16px !important;
          }
          .user-info span {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar