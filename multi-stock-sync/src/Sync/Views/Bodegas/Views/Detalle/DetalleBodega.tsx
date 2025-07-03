import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../../../../../axiosConfig"
import { Card, Typography, Statistic, Row, Col, Table, Input, Button, Space, Tooltip } from "antd"
import {
  EnvironmentOutlined,
  CalendarOutlined,
  ShopOutlined,
  BarcodeOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type { Warehouse } from "../../Types/warehouse.type"

const {Text } = Typography

interface StockItem {
  id: number
  id_mlc: string
  product_name: string
  quantity: number
  price: number
}

const DetalleBodega = () => {
  const { id } = useParams()
  const [bodega, setBodega] = useState<Warehouse | null>(null)
  const [stockList, setStockList] = useState<StockItem[]>([])
  const [newItem, setNewItem] = useState<StockItem>({
    id: Date.now(),
    id_mlc: "",
    product_name: "",
    quantity: 0,
    price: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/warehouses-list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        )
        const found = response.data.find((w: Warehouse) => w.id === parseInt(id || "", 10))
        setBodega(found || null)
      } catch (error) {
        console.error("Error al cargar bodega:", error)
      }
    }

    if (id) fetchData()
  }, [id])


  const stockColumns: ColumnsType<StockItem> = [
    {
      title: "ID MLC",
      dataIndex: "id_mlc",
      key: "id_mlc",
      render: (id_mlc: string) => (
        <Space>
          <BarcodeOutlined />
          <Text code>{id_mlc}</Text>
        </Space>
      ),
    },
    {
      title: "Producto",
      dataIndex: "product_name",
      key: "product_name",
      render: (name: string) => (
        <Tooltip title={name}>
          <Text strong>{name}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (_: number, record, index) => (
        <Input
          type="number"
          value={record.quantity}
          onChange={(e) => {
            const updated = [...stockList]
            updated[index].quantity = Number(e.target.value)
            setStockList(updated)
          }}
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (_: number, record, index) => (
        <Input
          type="number"
          prefix="$"
          value={record.price}
          onChange={(e) => {
            const updated = [...stockList]
            updated[index].price = Number(e.target.value)
            setStockList(updated)
          }}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button danger onClick={() => setStockList(stockList.filter((s) => s.id !== record.id))}>
          Eliminar
        </Button>
      ),
    },
  ]

  const handleAdd = () => {
    setStockList([...stockList, { ...newItem, id: Date.now() }])
    setNewItem({ id: Date.now(), id_mlc: "", product_name: "", quantity: 0, price: 0 })
  }

  if (!bodega) return <p>Cargando...</p>

  return (
    <div className="space-y-6 p-4">
      <Card bordered className="bg-gradient-to-r from-sky-50 to-blue-50 border-blue-100">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Statistic
              title="ID Bodega"
              value={bodega.id}
              prefix={<ShopOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Ubicación"
              value={bodega.location}
              prefix={<EnvironmentOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Compañía"
              value={bodega.company?.name || "Sin asignar"}
              prefix={<ShopOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Información general">
        <Space direction="vertical" size="middle">
          <Space>
            <CalendarOutlined className="text-blue-500" />
            <Text>Creado: {new Date(bodega.created_at).toLocaleString()}</Text>
          </Space>
          <Space>
            <CalendarOutlined className="text-blue-500" />
            <Text>Actualizado: {new Date(bodega.updated_at).toLocaleString()}</Text>
          </Space>
        </Space>
      </Card>

      <Card title="Stock en bodega" extra={
        <Space>
          <Input
            placeholder="ID MLC"
            value={newItem.id_mlc}
            onChange={(e) => setNewItem({ ...newItem, id_mlc: e.target.value })}
          />
          <Input
            placeholder="Producto"
            value={newItem.product_name}
            onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Precio"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
          />
          <Button type="primary" onClick={handleAdd}>
            Agregar
          </Button>
        </Space>
      }>
        <Table
          rowKey="id"
          columns={stockColumns}
          dataSource={stockList}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  )
}

export default DetalleBodega
