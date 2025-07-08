import { useEffect, useState } from "react";
import { Card, Table, Image, Typography, Alert, Button, Space, Modal, Tag, } from "antd";
import { ReloadOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../../axiosConfig";
import { generarpdfProductosInter } from"../PdfExcelCodigos/PDF/GenerarProductosInterPdf";
import { generarexcelProductosInter } from "../PdfExcelCodigos/Excel/GenerarProductosInterExcel";
import "./productosInternacionales.css";

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  date_created: string;
  pictures: { secure_url: string }[];
}

const { Title } = Typography;

const ProductosInternacionales: React.FC = () => {
  const [productos, setProductos] = useState<ProductoML[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const companyIds = ["4", "3", "2", "1"];

  const fetchTodosLosProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(
        companyIds.map((id) =>
          axiosInstance.get(
            `${import.meta.env.VITE_API_URL}/mercadolibre/china-products?company_id=${id}`
          )
        )
      );

      const combinados = responses.flatMap((res) =>
        Array.isArray(res.data.products) ? res.data.products : []
      );

      setProductos(combinados);
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("No se pudieron cargar los productos. Intenta nuevamente.");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodosLosProductos();
  }, []);

  const columnas = [
    {
      title: "Imagen",
      dataIndex: "imagen",
      key: "imagen",
      render: (url: string) =>
        url ? <Image src={url} width={50} alt="Producto" /> : "Sin imagen",
    },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Precio", dataIndex: "precio", key: "precio" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    {
      title: "Estado", dataIndex: "estado", key: "estado",
        render: (estado: string) => {
          const lower = estado?.toLowerCase();
          if (lower === "active") {
            return (
              <Tag
                style={{ backgroundColor: "#b9fbc0", color: "#000", borderColor: "#b9fbc0" }}
              >
                Activo
              </Tag>
            );
          } else if (lower === "paused") {
            return (
              <Tag
                style={{ backgroundColor: "#ffdab9", color: "#000", borderColor: "#ffdab9" }}
              >
                Pausado
              </Tag>
            );
          } else {
            return (
              <Tag
                style={{ backgroundColor: "#e5e7eb", color: "#000", borderColor: "#e5e7eb" }}
              >
                {estado}
              </Tag>
            );
          }
        },
      },

    { title: "Fecha de creación", dataIndex: "fecha", key: "fecha" },
  ];

  const dataSource = productos.map((producto) => ({
    key: producto.id,
    nombre: producto.title,
    precio: `$${producto.price.toLocaleString()}`,
    stock: producto.available_quantity,
    estado: producto.status,
    fecha: new Date(producto.date_created).toLocaleDateString(),
    imagen: producto.pictures?.[0]?.secure_url ?? "",
  }));

  const handleExportExcel = () => generarexcelProductosInter(productos);
  const handleExportPDF = () => {
    const uri = generarpdfProductosInter(productos);
    setPdfData(uri);
    setShowModal(true);
  };

  return (
    <>
      <Card className="productos-container">
        <div className="productos-header">
          <Title level={3} className="productos-title">Productos Internacionales</Title>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Exportar Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
              type="primary"
              danger
            >
              Exportar PDF
            </Button>
            <ReloadOutlined
              onClick={fetchTodosLosProductos}
              className="recargar-icono"
              style={{ fontSize: 20, cursor: "pointer" }}
              title="Recargar"
            />
          </Space>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columnas}
          dataSource={dataSource}
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
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} productos`,
          }}  
          
          locale={{ emptyText: "No hay productos disponibles." }}
          rowKey="key"
          className="custom-table"
        />
      </Card>

      <Modal
        title="Vista previa del PDF"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => {
          if (pdfData) {
            const link = document.createElement("a");
            link.href = pdfData;
            link.download = "ProductosInternacionales.pdf";
            link.click();
          }
          setShowModal(false);
        }}
        width="80%"
        okText="Descargar PDF"
        cancelText="Cerrar"
      >
        {pdfData && (
          <iframe
            src={pdfData}
            title="Vista previa PDF"
            style={{ width: "100%", height: "70vh", border: "none" }}
          />
        )}
      </Modal>
    </>
  );
};

export default ProductosInternacionales;
