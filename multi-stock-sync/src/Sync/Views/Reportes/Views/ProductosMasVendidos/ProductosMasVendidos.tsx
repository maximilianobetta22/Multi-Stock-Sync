import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { Bar } from "react-chartjs-2"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import axiosInstance from "../../../../../axiosConfig"
import { Link } from "react-router-dom"
import type { ChartOptions } from "chart.js"
import {
  Typography,
  Row,
  Col,
  Card,
  Table,
  Button,
  Select,
  Space,
  Spin,
  Alert,
  Modal,
  Statistic,
  Dropdown,
  Badge,
  Empty,
  Divider,
  Grid,
  type MenuProps,
} from "antd"
import {
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  HomeOutlined,
  MenuOutlined,
  TrophyOutlined,
  FallOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"

const { Title, Text } = Typography
const { useBreakpoint } = Grid

// Función para obtener la fecha actual en formato YYYY-MM
const getCurrentYearMonth = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  return `${year}-${month}`
}

const Productos: React.FC = () => {
  const screens = useBreakpoint()
  const { client_id } = useParams<{ client_id: string }>() // captura el id del cliente por url
  const [productos, setProductos] = useState<any[]>([]) // Función donde se almacenan los datos que se obtienen de la api
  const [loading, setLoading] = useState<boolean>(true) // Función de carga de los datos y de la pagina
  const [error] = useState<string | null>(null) // Función que captura los datos
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth())
  const itemsPerPage = 6 // Numero maximo por pagina (reducido de 10 a 6)
  const maxPageButtons = 10 // Numero maximo que muestra por pantalla si hay mas de 12 paginas compaginadas igual se muestran
  const [maxProducts, setMaxProducts] = useState(10) // Número máximo de productos para mostrar en el gráfico
  const [sortOrder, setSortOrder] = useState<"top" | "bottom">("top") // Ordenar de más a menos
  const chartRef = useRef<HTMLDivElement | null>(null)
  const pdfRef = useRef<jsPDF | null>(null) // Función que genera el pdf
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const currencyFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  })

  // Estados separados para año y mes
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonthNumber, setSelectedMonthNumber] = useState<number>(new Date().getMonth() + 1)

  // Estados separados para productos históricos
  const [productosHistoricos, setProductosHistoricos] = useState<any[]>([])
  const [loadingHistoricos, setLoadingHistoricos] = useState<boolean>(false)
  const [showHistorical, setShowHistorical] = useState<boolean>(false)

  // Actualizar selectedMonth cuando cambien año o mes
  useEffect(() => {
    const monthStr = selectedMonthNumber.toString().padStart(2, "0")
    setSelectedMonth(`${selectedYear}-${monthStr}`)
  }, [selectedYear, selectedMonthNumber])

  useEffect(() => {
    const fetchProductos = async () => {
      if (!selectedMonth) {
        setProductos([])
        setLoading(false)
        return // Verifica que selectedMonth no esté vacío
      }
      setLoading(true)
      try {
        const [year, month] = selectedMonth.split("-")
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/top-selling-products/${client_id}?year=${year}&month=${month}`,
        )
        const data = response.data
        if (data.status === "success") {
          setProductos(data.data)
        } else {
          console.error("No se pudieron obtener los productos para el mes:", selectedMonth)
          setProductos([])
        }
      } catch (error) {
        console.error("Error al hacer la solicitud para el mes:", selectedMonth, error)
        setProductos([])
      } finally {
        setLoading(false) // Al terminar la carga, setea loading a false
      }
    }
    fetchProductos()
  }, [client_id, selectedMonth])

  useEffect(() => {
    const fetchProductosHistoricos = async () => {
      setLoadingHistoricos(true)
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/top-selling-products/${client_id}`,
        )
        const data = response.data
        if (data.status === "success") {
          setProductosHistoricos(data.data)
        } else {
          console.error("No se pudieron obtener los productos históricos")
          setProductosHistoricos([])
        }
      } catch (error) {
        console.error("Error al obtener productos históricos:", error)
        setProductosHistoricos([])
      } finally {
        setLoadingHistoricos(false)
      }
    }
    fetchProductosHistoricos()
  }, [client_id])

  const indexOfLastProduct = currentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct)

  // Calcular el total de páginas
  const totalPages = Math.ceil(productos.length / itemsPerPage)

  // Función para manejar la paginación
  type PageItem = number | "..."
  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentPage(1)
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages)
    } else {
      setCurrentPage(pageNumber)
    }
  }

  // Función del renderizado de los botones y el compaginado de la pagina de la tabla
  const renderPaginationButtons = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    const pages: PageItem[] = []
    if (startPage > 1) pages.push(1)
    if (startPage > 2) pages.push("...")

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) pages.push("...")
    if (endPage < totalPages) pages.push(totalPages)

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={index} style={{ padding: "0 8px" }}>
          ...
        </span>
      ) : (
        <Button
          key={index}
          onClick={() => paginate(page as number)}
          type={currentPage === page ? "primary" : "default"}
          size="small"
          style={{ margin: "0 2px" }}
        >
          {page}
        </Button>
      ),
    )
  }

  // Función que genera el grafico del torta
  const getChartData = () => {
    const dataToUse = showHistorical ? productosHistoricos : productos

    if (dataToUse.length === 0) {
      return { labels: [], datasets: [] }
    }

    // Ordenar los productos
    const sortedChartProducts = [...dataToUse].sort((a, b) => {
      if (sortOrder === "top") {
        return b.quantity - a.quantity // Más vendidos
      } else {
        return a.quantity - b.quantity // Menos vendidos
      }
    })

    const topNProducts = sortedChartProducts.slice(0, maxProducts)

    return {
      labels: topNProducts.map((producto) => {
        // Truncar títulos largos para mejor visualización
        const title = producto.title || "Sin título"
        return title.length > 30 ? title.substring(0, 30) + "..." : title
      }),
      datasets: [
        {
          label: "Cantidad Vendida",
          data: topNProducts.map((producto) => producto.quantity),
          backgroundColor: "rgba(24, 144, 255, 0.8)",
          borderColor: "rgba(24, 144, 255, 1)",
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  }
  const chartData = getChartData()
  const totalQuantity = productos.reduce((sum, producto) => sum + producto.quantity, 0)

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataToUse = showHistorical ? productosHistoricos : productos
            const sortedProducts = [...dataToUse].sort((a, b) => {
              if (sortOrder === "top") {
                return b.quantity - a.quantity
              } else {
                return a.quantity - b.quantity
              }
            })
            const producto = sortedProducts[context.dataIndex]
            return `${producto.title}: ${producto.quantity} unidades vendidas`
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(24, 144, 255, 1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#333",
          font: {
            size: 11,
            weight: "bolder",
          },
          maxRotation: 0,
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 10,
        bottom: 10,
      },
    },
  }

  const getMostAndLeastSoldProduct = () => {
    if (productos.length === 0) return { mostSold: null, leastSold: null }
    const sortedByQuantity = [...productos].sort((a, b) => b.quantity - a.quantity)
    return {
      mostSold: sortedByQuantity[0],
      leastSold: sortedByQuantity[sortedByQuantity.length - 1],
    }
  }

  const getHistoricalMostAndLeastSoldProduct = () => {
    if (productosHistoricos.length === 0) return { mostSoldHistorical: null, leastSoldHistorical: null }
    const sortedByQuantity = [...productosHistoricos].sort((a, b) => b.quantity - a.quantity)
    return {
      mostSoldHistorical: sortedByQuantity[0],
      leastSoldHistorical: sortedByQuantity[sortedByQuantity.length - 1],
    }
  }

  const { mostSold, leastSold } = getMostAndLeastSoldProduct()
  const { mostSoldHistorical, leastSoldHistorical } = getHistoricalMostAndLeastSoldProduct()

  // Función mejorada que genera el excel
  const exportToExcel = () => {
    // Datos principales con formato mejorado
    const mainData = productos.map((producto, index) => ({
      "N°": index + 1,
      SKU: producto.sku || "N/A",
      "Título del Producto": producto.title || "Sin título",
      Talla: producto.size || "N/A",
      "Cantidad Vendida": producto.quantity || 0,
      "% Cantidad": Number.parseFloat(((producto.quantity / totalQuantity) * 100).toFixed(2)),
      "Monto Total": producto.total_amount || 0,
      "% Monto": Number.parseFloat(
        ((producto.total_amount / productos.reduce((sum, p) => sum + (p.total_amount || 0), 0)) * 100).toFixed(2),
      ),
      "ID Variante": producto.variation_id || "N/A",
      "ID Producto": producto.id || "N/A",
    }))

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Hoja principal con datos
    const wsMain = XLSX.utils.json_to_sheet(mainData)

    // Configurar anchos de columna para la hoja principal
    wsMain["!cols"] = [
      { wch: 5 }, // N°
      { wch: 15 }, // SKU
      { wch: 50 }, // Título
      { wch: 10 }, // Talla
      { wch: 12 }, // Cantidad
      { wch: 12 }, // % Cantidad
      { wch: 15 }, // Monto
      { wch: 12 }, // % Monto
      { wch: 15 }, // ID Variante
      { wch: 15 }, // ID Producto
    ]

    XLSX.utils.book_append_sheet(workbook, wsMain, "Productos Detallados")

    const fileName = `Reporte_Productos_${selectedYear}_${selectedMonthNumber.toString().padStart(2, "0")}_Cliente_${client_id}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // Función corregida que genera el pdf del reporte de productos
  const generatePDF = async () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    // Configuración de colores (corregido)
    const primaryColor: [number, number, number] = [220, 53, 69] // Rojo
    const textColor: [number, number, number] = [51, 51, 51] // Gris oscuro

    // Header con título
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 35, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("REPORTE DE PRODUCTOS MÁS VENDIDOS", pageWidth / 2, 15, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Multi Stock Sync - Sistema de Gestión", pageWidth / 2, 25, { align: "center" })

    yPosition = 50

    // Información del cliente y período
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DEL REPORTE", 15, yPosition)

    yPosition += 10
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const monthName = new Date(selectedYear, selectedMonthNumber - 1, 1).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })

    const reportInfo = [
      [`Cliente ID:`, client_id || ""],
      [`Período:`, monthName.charAt(0).toUpperCase() + monthName.slice(1)],
      [`Fecha de generación:`, new Date().toLocaleDateString("es-CL")],
      [`Total de productos:`, productos.length.toString()],
      [`Cantidad total vendida:`, totalQuantity.toString()],
      [`Monto total:`, currencyFormat.format(productos.reduce((sum, p) => sum + (p.total_amount || 0), 0))],
    ]

    reportInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 15, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(value, 80, yPosition)
      yPosition += 7
    })

    yPosition += 10

    // Productos destacados
    if (mostSold || leastSold) {
      doc.setFillColor(245, 245, 245)
      doc.rect(10, yPosition - 5, pageWidth - 20, 45, "F")

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("PRODUCTOS DESTACADOS", 15, yPosition + 5)

      yPosition += 15
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(11)

      if (mostSold) {
        doc.setFont("helvetica", "bold")
        doc.text("Producto Más Vendido:", 15, yPosition)
        doc.setFont("helvetica", "normal")
        const mostSoldTitle = mostSold.title.length > 50 ? mostSold.title.substring(0, 50) + "..." : mostSold.title
        doc.text(`${mostSoldTitle} (${mostSold.quantity} unidades)`, 15, yPosition + 7)
        doc.text(`Monto: ${currencyFormat.format(mostSold.total_amount)}`, 15, yPosition + 14)
      }

      if (leastSold) {
        doc.setFont("helvetica", "bold")
        doc.text("Producto Menos Vendido:", 15, yPosition + 25)
        doc.setFont("helvetica", "normal")
        const leastSoldTitle = leastSold.title.length > 50 ? leastSold.title.substring(0, 50) + "..." : leastSold.title
        doc.text(`${leastSoldTitle} (${leastSold.quantity} unidades)`, 15, yPosition + 32)
        doc.text(`Monto: ${currencyFormat.format(leastSold.total_amount)}`, 15, yPosition + 39)
      }

      yPosition += 55
    }

    // Tabla de productos con mejor manejo de texto largo
    const tableData = productos.map((prod, index) => [
      (index + 1).toString(),
      prod.title && prod.title.length > 35 ? prod.title.substring(0, 35) + "..." : prod.title || "Sin título",
      prod.sku || "N/A",
      (prod.quantity || 0).toString(),
      `${((prod.quantity / totalQuantity) * 100).toFixed(1)}%`,
      currencyFormat.format(prod.total_amount || 0),
      prod.size || "N/A",
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Producto", "SKU", "Cant.", "% Cant.", "Total", "Talla"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 70, halign: "left" }, // Más ancho para el producto
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 30, halign: "right" },
        6: { cellWidth: 15, halign: "center" },
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      didDrawPage: () => {
        // Footer en cada página
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(0, pageHeight - 20, pageWidth, 20, "F")

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text("Multi Stock Sync © 2024", 15, pageHeight - 10)
        doc.text(new Date().toLocaleDateString("es-CL"), pageWidth / 2, pageHeight - 10, { align: "center" })
      },
    })

    pdfRef.current = doc
    const pdfBlob = doc.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    setPdfData(pdfUrl)
    setShowPDFModal(true)
  }

  const savePDF = () => {
    if (pdfRef.current) {
      const fileName = `Reporte_Productos_${selectedYear}_${selectedMonthNumber.toString().padStart(2, "0")}_Cliente_${client_id}.pdf`
      pdfRef.current.save(fileName)
      setShowPDFModal(false)
    }
  }

  // función que ordena los productos
  const sortedProducts = [...productos].sort((a, b) => b.quantity - a.quantity)
  const bestSellingProduct = sortedProducts.length > 0 ? sortedProducts[0] : null
  const leastSellingProduct = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null

  // Configuración de la tabla para Ant Design (con porcentajes agregados)
  const columns: ColumnsType<any> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (value: number) => (
        <div style={{ textAlign: "center" }}>
          <Badge count={value} style={{ backgroundColor: "#1890ff" }} />
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {((value / totalQuantity) * 100).toFixed(1)}%
          </Text>
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 150,
      align: "right",
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (value: number) => (
        <div style={{ textAlign: "right" }}>
          <Text strong style={{ color: "#3f8600", fontSize: "14px" }}>
            {currencyFormat.format(value)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {value > 0
              ? `${((value / productos.reduce((sum, p) => sum + p.total_amount, 0)) * 100).toFixed(1)}%`
              : "0%"}
          </Text>
        </div>
      ),
    },
    {
      title: "Talla",
      dataIndex: "size",
      key: "size",
      width: 80,
      align: "center",
      render: (text: string) => <Badge status="processing" text={text || "N/A"} />,
    },
  ]

  // Menú para filtros del gráfico
  const sortMenuItems: MenuProps["items"] = [
    {
      key: "top",
      label: (
        <Space>
          <SortDescendingOutlined />
          Más Vendidos
        </Space>
      ),
      onClick: () => setSortOrder("top"),
    },
    {
      key: "bottom",
      label: (
        <Space>
          <SortAscendingOutlined />
          Menos Vendidos
        </Space>
      ),
      onClick: () => setSortOrder("bottom"),
    },
  ]

  const maxProductsMenuItems: MenuProps["items"] = [5, 10, 25, 50].map((option) => ({
    key: option.toString(),
    label: `${option} productos`,
    onClick: () => setMaxProducts(option),
  }))

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* HEADER PRINCIPAL */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <BarChartOutlined style={{ marginRight: 12 }} />
              Reporte de Productos
            </Title>
            <Text type="secondary">Cliente: {client_id}</Text>
          </Col>
          {!screens.xs && (
            <Col>
              <Space size="large">
                <Statistic
                  title="Total Productos"
                  value={productos.length}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
                <Statistic
                  title="Cantidad Total"
                  value={totalQuantity}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* CONTROLES SUPERIORES */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>
                <CalendarOutlined /> Año
              </Text>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: "100%" }}
                size="large"
                placeholder="Seleccionar año"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <Select.Option key={year} value={year}>
                      {year}
                    </Select.Option>
                  )
                })}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={8} md={6} lg={4}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>
                <CalendarOutlined /> Mes
              </Text>
              <Select
                value={selectedMonthNumber}
                onChange={setSelectedMonthNumber}
                style={{ width: "100%" }}
                size="large"
                placeholder="Seleccionar mes"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const monthNumber = i + 1
                  const monthName = new Date(2024, i, 1).toLocaleDateString("es-ES", { month: "long" })
                  return (
                    <Select.Option key={monthNumber} value={monthNumber}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </Select.Option>
                  )
                })}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={8} md={12} lg={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={exportToExcel}
                  size="large"
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  {!screens.xs && "Exportar"} Excel
                </Button>
              </Col>
              <Col>
                <Button type="primary" icon={<FilePdfOutlined />} onClick={generatePDF} size="large" danger>
                  {!screens.xs && "Generar"} PDF
                </Button>
              </Col>
              <Col>
                <Link to="/sync/reportes/home">
                  <Button icon={<MenuOutlined />} size="large">
                    {!screens.xs && "Menú"} Reportes
                  </Button>
                </Link>
              </Col>
              <Col>
                <Link to="/sync/home">
                  <Button icon={<HomeOutlined />} size="large">
                    {!screens.xs && "Ir a"} Inicio
                  </Button>
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Información adicional - LA NOTIFICACIÓN QUE TE GUSTÓ */}
      <Alert
        message="Información del Reporte"
        description={
          <Space wrap>
            <Text>
              <InfoCircleOutlined /> Total de productos analizados: <strong>{productos.length}</strong>
            </Text>
            <Text>
              • Monto total:{" "}
              <strong>{currencyFormat.format(productos.reduce((sum, p) => sum + (p.total_amount || 0), 0))}</strong>
            </Text>
            <Text>
              • Período:{" "}
              <strong>
                {new Date(selectedYear, selectedMonthNumber - 1, 1).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </Text>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[24, 24]}>
        {/* COLUMNA IZQUIERDA - TABLA */}
        <Col xs={24} lg={16}>
          {/* TABLA DE PRODUCTOS */}
          <Card
            title={
              <Space>
                <ShoppingOutlined style={{ color: "#1890ff" }} />
                <span>Lista de Productos</span>
                <Badge count={productos.length} style={{ backgroundColor: "#1890ff" }} />
              </Space>
            }
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", marginBottom: 24 }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" tip="Cargando productos..." />
              </div>
            ) : error ? (
              <Alert message={error} type="error" showIcon />
            ) : productos.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  dataSource={currentProducts}
                  rowKey={(record, index) => `${record.sku}-${index}`}
                  pagination={false}
                  scroll={{ x: 800 }}
                  size="middle"
                />
                {/* Paginación personalizada */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flexDirection: screens.xs ? 'column' : 'row', }}>
                  <Text type="secondary">
                    Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, productos.length)} de{" "}
                    {productos.length} productos
                  </Text>
                  {/* Para un mejor control del tamaño se agregó otro div */}
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                      Anterior
                    </Button>
                    {renderPaginationButtons()}
                    <Button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <Empty description="No hay productos disponibles para el período seleccionado" />
            )}
          </Card>

          {/* GRÁFICO DE BARRAS - AHORA DEBAJO DE LA TABLA */}
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1890ff" }} />
                <span>Productos Más Vendidos</span>
                <Badge
                  count={
                    showHistorical ? "Histórico" : `${selectedYear}-${selectedMonthNumber.toString().padStart(2, "0")}`
                  }
                  style={{ backgroundColor: showHistorical ? "#52c41a" : "#1890ff" }}
                />
              </Space>
            }
            extra={
              <Space wrap>
                <Button
                  type={showHistorical ? "default" : "primary"}
                  size="small"
                  onClick={() => setShowHistorical(false)}
                  icon={<CalendarOutlined />}
                >
                  Período
                </Button>
                <Button
                  type={showHistorical ? "primary" : "default"}
                  size="small"
                  onClick={() => setShowHistorical(true)}
                  icon={<TrophyOutlined />}
                >
                  Histórico
                </Button>
                <Dropdown menu={{ items: sortMenuItems }} placement="bottomRight">
                  <Button icon={<FilterOutlined />} size="small">
                    {sortOrder === "top" ? "Más Vendidos" : "Menos Vendidos"}
                  </Button>
                </Dropdown>
                <Dropdown menu={{ items: maxProductsMenuItems }} placement="bottomRight">
                  <Button icon={<SortAscendingOutlined />} size="small">
                    Top {maxProducts}
                  </Button>
                </Dropdown>
              </Space>
            }
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <div style={{ height: "400px" }} ref={chartRef}>
              {loading || (showHistorical && loadingHistoricos) ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Spin size="large" tip="Cargando gráfico..." />
                </div>
              ) : (showHistorical ? productosHistoricos : productos).length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                  <Empty
                    description={`No hay datos para mostrar el gráfico ${showHistorical ? "histórico" : "del período seleccionado"}.`}
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* COLUMNA DERECHA - TARJETAS DE RESUMEN */}
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined style={{ color: "#faad14" }} />
                    <span>Producto Más Vendido</span>
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {bestSellingProduct ? (
                  <div>
                    <Title level={5} style={{ marginBottom: 8, color: "#1890ff" }}>
                      {bestSellingProduct.title || "Sin título"}
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Cantidad"
                          value={bestSellingProduct.quantity ?? "N/D"}
                          valueStyle={{ color: "#3f8600" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Total"
                          value={bestSellingProduct.total_amount ?? 0}
                          formatter={(value) => currencyFormat.format(Number(value))}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Space>
                      <Text type="secondary">Talla: {bestSellingProduct.size || "N/A"}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">Variante: {bestSellingProduct.variation_id || "N/A"}</Text>
                    </Space>
                  </div>
                ) : (
                  <Empty description="No hay datos disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title={
                  <Space>
                    <FallOutlined style={{ color: "#ff4d4f" }} />
                    <span>Producto Menos Vendido</span>
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {leastSellingProduct ? (
                  <div>
                    <Title level={5} style={{ marginBottom: 8, color: "#1890ff" }}>
                      {leastSellingProduct.title || "Sin título"}
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Cantidad"
                          value={leastSellingProduct.quantity ?? "N/D"}
                          valueStyle={{ color: "#3f8600" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Total"
                          value={leastSellingProduct.total_amount ?? 0}
                          formatter={(value) => currencyFormat.format(Number(value))}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Space>
                      <Text type="secondary">Talla: {leastSellingProduct.size || "N/A"}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">Variante: {leastSellingProduct.variation_id || "N/A"}</Text>
                    </Space>
                  </div>
                ) : (
                  <Empty description="No hay datos disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined style={{ color: "#52c41a" }} />
                    <span>Más Vendido Históricamente</span>
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {loadingHistoricos ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin size="small" tip="Cargando..." />
                  </div>
                ) : mostSoldHistorical ? (
                  <div>
                    <Title level={5} style={{ marginBottom: 8, color: "#1890ff" }}>
                      {mostSoldHistorical.title || "Sin título"}
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Cantidad"
                          value={mostSoldHistorical.quantity ?? "N/D"}
                          valueStyle={{ color: "#3f8600" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Total"
                          value={mostSoldHistorical.total_amount ?? 0}
                          formatter={(value) => currencyFormat.format(Number(value))}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Space>
                      <Text type="secondary">Talla: {mostSoldHistorical.size || "N/A"}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">Variante: {mostSoldHistorical.variation_id || "N/A"}</Text>
                    </Space>
                  </div>
                ) : (
                  <Empty description="No hay datos históricos disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title={
                  <Space>
                    <FallOutlined style={{ color: "#ff7875" }} />
                    <span>Menos Vendido Históricamente</span>
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {loadingHistoricos ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin size="small" tip="Cargando..." />
                  </div>
                ) : leastSoldHistorical ? (
                  <div>
                    <Title level={5} style={{ marginBottom: 8, color: "#1890ff" }}>
                      {leastSoldHistorical.title || "Sin título"}
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Cantidad"
                          value={leastSoldHistorical.quantity ?? "N/D"}
                          valueStyle={{ color: "#3f8600" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Total"
                          value={leastSoldHistorical.total_amount ?? 0}
                          formatter={(value) => currencyFormat.format(Number(value))}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Space>
                      <Text type="secondary">Talla: {leastSoldHistorical.size || "N/A"}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">Variante: {leastSoldHistorical.variation_id || "N/A"}</Text>
                    </Space>
                  </div>
                ) : (
                  <Empty description="No hay datos históricos disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* MODAL PARA VISTA PREVIA DEL PDF */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Vista previa del PDF
          </Space>
        }
        open={showPDFModal}
        onCancel={() => setShowPDFModal(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setShowPDFModal(false)}>
            Cerrar
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={savePDF}>
            Guardar PDF
          </Button>,
        ]}
      >
        <div style={{ height: "70vh" }}>
          {pdfData && (
            <object
              data={pdfData}
              type="application/pdf"
              style={{ width: "100%", height: "100%" }}
              aria-label="PDF Preview"
            >
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Alert
                  message="No se puede mostrar el PDF"
                  description={
                    <div>
                      <p>Parece que su navegador no puede mostrar PDFs.</p>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={savePDF}>
                        Descargar PDF directamente
                      </Button>
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </div>
            </object>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Productos;
