import { useState, useEffect } from "react"
import { Alert, Modal, Table, Button, Input, message, Space, Typography, Badge, Tooltip, Card } from "antd"
import { DownloadOutlined, MailOutlined, WarningOutlined, BellOutlined, CloseOutlined } from "@ant-design/icons"
import { useStockCritic } from "../Sync/Hooks/useStockCritic"

const { Text, Title } = Typography

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

function getClientIdFromConexionSeleccionada(): string | undefined {
  try {
    const raw = localStorage.getItem("conexionSeleccionada")
    if (!raw) return undefined
    const obj = JSON.parse(raw)
    return obj.client_id
  } catch {
    return undefined
  }
}

function isUserLoggedIn(): boolean {
  const token = localStorage.getItem("token")
  return !!token
}

export default function StockCriticAlert() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [authState, setAuthState] = useState({
    isLoggedIn: isUserLoggedIn(),
    clientId: getClientIdFromConexionSeleccionada(),
  })

  const clientId = authState.clientId ? Number(authState.clientId) : undefined
  const { data, loading, error } = useStockCritic(clientId)

  // Escuchar cambios en localStorage para manejar login/logout y cambios de conexión
  useEffect(() => {
    const handleStorageChange = () => {
      const newAuthState = {
        isLoggedIn: isUserLoggedIn(),
        clientId: getClientIdFromConexionSeleccionada(),
      }

      // Si cambió el estado de autenticación o la conexión, resetear el componente
      if (newAuthState.isLoggedIn !== authState.isLoggedIn || newAuthState.clientId !== authState.clientId) {
        setAuthState(newAuthState)
        setIsModalOpen(false) // Cerrar modal si estaba abierto
        setEmail("") // Limpiar email
      }
    }

    // Escuchar cambios en localStorage
    window.addEventListener("storage", handleStorageChange)

    // También verificar cambios cada segundo (para cambios en la misma pestaña)
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [authState])

  // No mostrar nada si el usuario no está logueado
  if (!authState.isLoggedIn) {
    return null
  }

  // No mostrar nada si no hay clientId
  if (!clientId) {
    return null
  }

  // No mostrar nada si no hay datos críticos (excepto cuando está cargando)
  if (!loading && (!data || data.length === 0)) {
    return null
  }

  const token = localStorage.getItem("token")

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/mercadolibre/stock-critic/${clientId}?excel=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json()
        message.error(error.message || "No se pudo descargar el archivo")
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `stock-critico-${clientId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      message.success("Archivo descargado correctamente")
    } catch (e) {
      message.error("Error de red al descargar el archivo")
    } finally {
      setDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!email) {
      message.warning("Ingrese un email válido.")
      return
    }

    setSending(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/mercadolibre/stock-critic/${clientId}?mail=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (res.ok) {
        message.success("Email enviado correctamente.")
        setEmail("")
      } else {
        const error = await res.json()
        message.error(error.message || "Error al enviar el email.")
      }
    } catch {
      message.error("Error de red.")
    } finally {
      setSending(false)
    }
  }

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // Mostrar error en el trigger si hay error
  if (error) {
    return (
      <Tooltip title="Error al cargar stock crítico">
        <Button
          type="text"
          danger
          icon={<WarningOutlined />}
          onClick={() => message.error(error)}
          style={{
            marginLeft: 8,
            color: "#ff4d4f",
          }}
        >
          Error
        </Button>
      </Tooltip>
    )
  }

  // Trigger button con badge si hay productos críticos - Mejorado para header
  const triggerButton = (
    <Tooltip title={loading ? "Cargando alertas..." : `${data?.length || 0} productos con stock crítico`}>
      <Badge
       showZero
       count={loading ? 0 : data?.length || 0} size="small" offset={[0, 0]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={showModal}
          loading={loading}
          style={{
            marginLeft: 8,
            color: data && data.length > 0 ? "#faad14" : "#ffffff",
            borderColor: "transparent",
            display: "flex",
            alignItems: "center",
            height: "32px",
          }}
        >
          <span style={{ marginLeft: 4, color: data && data.length > 0 ? "#faad14" : "#ffffff" }}>Alertas</span>
        </Button>
      </Badge>
    </Tooltip>
  )

  return (
    <>
      {triggerButton}

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#faad14" }} />
            <Title level={4} style={{ margin: 0 }}>
              Stock Crítico - MercadoLibre
            </Title>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        width={900}
        footer={null}
        closeIcon={<CloseOutlined />}
        destroyOnClose={true} // Destruir el modal al cerrarlo para limpiar estado
      >
        {error ? (
          <Alert
            message="Error al cargar datos"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Alert
                message={
                  <Space>
                    <Text strong>¡Atención! Stock crítico detectado</Text>
                    <Text type="danger">({data?.length || 0} productos críticos)</Text>
                  </Space>
                }
                type="warning"
                showIcon
                style={{ border: "none", background: "transparent" }}
              />
            </Card>

            <Card title="Acciones" size="small" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading}>
                  Descargar Excel
                </Button>

                <Input.Group compact>
                  <Input
                    placeholder="Enviar reporte a email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                    disabled={sending}
                    onPressEnter={handleSendEmail}
                  />
                  <Button
                    type="default"
                    icon={<MailOutlined />}
                    loading={sending}
                    onClick={handleSendEmail}
                    disabled={sending}
                  >
                    Enviar
                  </Button>
                </Input.Group>
              </Space>
            </Card>

            <Card title="Productos con Stock Crítico" size="small">
              <Table
                dataSource={data}
                rowKey="id"
                size="small"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                    locale: {
                      items_per_page: "por página",
                      jump_to: "Ir a",
                      jump_to_confirm: "confirmar",
                      page: "Página",
                      prev_page: "Página anterior",
                      next_page: "Página siguiente",
                    },
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
                }}
                scroll={{ y: 400 }}
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    width: 120,
                    fixed: "left",
                  },
                  {
                    title: "Nombre del Producto",
                    dataIndex: "title",
                    width: 300,
                    render: (text: string, record: any) => (
                      <a href={record.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "#1890ff" }}>
                        {text}
                      </a>
                    ),
                  },
                  {
                    title: "Stock",
                    dataIndex: "available_quantity",
                    align: "center",
                    width: 100,
                  render: (stock: number | undefined) => (
                    <Badge
                      count={typeof stock === "number" ? stock : 0}
                      showZero
                      style={{
                        backgroundColor: stock !== undefined && stock <= 0 ? "#ff4d4f" : "#faad14",
                      }}
                      />
                    ),
                    sorter: (a: any, b: any) => a.available_quantity - b.available_quantity,
                  },
                  {
                    title: "Precio",
                    dataIndex: "price",
                    width: 120,
                    render: (price: number) => <Text strong>${price.toLocaleString()}</Text>,
                    sorter: (a: any, b: any) => a.price - b.price,
                  },
                ]}
              />
            </Card>
          </>
        )}
      </Modal>
    </>
  )
}
