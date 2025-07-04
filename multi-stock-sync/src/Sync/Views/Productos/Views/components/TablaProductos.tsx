import { Table, Button, Tag, Dropdown, Tooltip } from "antd";
import {
  EditOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  has_bids?: boolean;
  catalog_listing?: boolean;
  description?: { plain_text: string };
  pictures?: { secure_url: string }[];
  atributes?: any[];
  date_created?: string;
  permalink?: string;
  sku?: string;
}

interface Props {
  productos: ProductoML[];
  loading: boolean;
  pagina: number;
  total: number;
  fetchProductos: (
    page: number,
    sort_by?: string,
    order?: "asc" | "desc",
    search?: string,
    from?: string,
    to?: string,
    status?: string
  ) => void;
  setPagina: (page: number) => void;
  handleEditar: (producto: ProductoML) => void;
  toggleEstado: (producto: ProductoML) => void;
  busquedaActual: string;
  fechaInicio?: string;
  fechaFin?: string;
  estadoFiltro?: string;
  mostrarDetalles: (producto: ProductoML) => void;
}

export const TablaProductos = ({
  productos,
  loading,
  pagina,
  total,
  fetchProductos,
  setPagina,
  handleEditar,
  toggleEstado,
  busquedaActual,
  fechaInicio,
  fechaFin,
  estadoFiltro,
}: Props) => {
  const traducirEstado = (status: string) => {
    const map: any = {
      active: "Activo",
      paused: "Pausado",
      under_review: "En revisión",
    };
    return map[status] || status;
  };

  const colorEstado = (status: string) => {
    const map: any = {
      active: "green",
      paused: "orange",
      under_review: "blue",
    };
    return map[status] || "default";
  };

  const resaltarTexto = (texto: string, keyword: string) => {
    if (!keyword) return texto;
    const partes = texto.split(new RegExp(`(${keyword})`, "gi"));
    return (
      <>
        {partes.map((parte, i) =>
          parte.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: "#ffe58f", padding: 0 }}>
              {parte}
            </mark>
          ) : (
            <span key={i}>{parte}</span>
          )
        )}
      </>
    );
  };

  const columns: ColumnsType<ProductoML> = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text) => (
        <span style={{ fontFamily: "monospace" }}>
          {resaltarTexto(text, busquedaActual)}
        </span>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      render: (sku) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
          {sku || "No disponible"}
        </span>
      ),
    },
    {
      title: "Título",
      dataIndex: "title",
      render: (_, record) => {
        const textoResaltado = resaltarTexto(record.title, busquedaActual);
        const link = (record as any).permalink;

        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: 500,
              color: "#1677ff",
              textDecoration: "none",
              transition: "color 0.2s, text-decoration 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.color = "#0958d9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
              e.currentTarget.style.color = "#1677ff";
            }}
          >
            {textoResaltado}
          </a>
        );
      },
    },
    {
      title: "Fecha",
      dataIndex: "date_created",
      render: (fecha) => dayjs(fecha).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "Precio",
      dataIndex: "price",
      render: (text) => <strong>${text.toLocaleString("es-CL")}</strong>,
    },
    {
      title: "Stock",
      dataIndex: "available_quantity",
      sorter: true,
      render: (text) => <span>{text} u.</span>,
    },
    {
      title: "Estado",
      dataIndex: "status",
      render: (estado) => (
        <Tag color={colorEstado(estado)} style={{ fontWeight: 500 }}>
          {traducirEstado(estado)}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      render: (_, record) => {
        const items = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Editar",
            onClick: () => handleEditar(record),
          },
          {
            key: "toggle",
            icon:
              record.status === "active" ? (
                <PauseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              ),
            label: record.status === "active" ? "Pausar" : "Activar",
            onClick: () => toggleEstado(record),
          },
        ];

        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: items.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: <span onClick={item.onClick}>{item.label}</span>,
              })),
            }}
          >
            <Tooltip title="Más acciones">
              <Button shape="circle" icon={<MoreOutlined />} />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={productos}
      rowKey="id"
      loading={loading}
      size="middle"
      pagination={{
        current: pagina,
        pageSize: 50,
        total,
        showSizeChanger: false,
        onChange: (page) => {
          setPagina(page);
          fetchProductos(
            page,
            "date_created",
            "desc",
            busquedaActual,
            fechaInicio,
            fechaFin,
            estadoFiltro
          );
        },
      }}
      onChange={(pagination, _, sorter) => {
        const page = pagination.current || 1;
        let sort_by = "date_created";
        let order: "asc" | "desc" = "desc";
        if (!Array.isArray(sorter) && typeof sorter === "object" && sorter) {
          sort_by =
            "field" in sorter && sorter.field
              ? (sorter.field as string)
              : "date_created";
          order = sorter.order === "ascend" ? "asc" : "desc";
        }
        setPagina(page);
        fetchProductos(
          page,
          sort_by,
          order,
          busquedaActual,
          fechaInicio,
          fechaFin,
          estadoFiltro
        );
      }}
      bordered
    />
  );
};