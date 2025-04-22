import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Product } from "../Types/warehouse.type";

interface ProductTableProps {
  products: Product[];
  placeholderImage: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  placeholderImage,
}) => {
  const columns: ColumnsType<Product> = [
    {
      title: "Imagen",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (thumbnail, record) => (
        <img
          src={thumbnail}
          alt={record.title}
          style={{ width: "50px", height: "50px", borderRadius: "4px" }}
          onError={(e) => (e.currentTarget.src = placeholderImage)}
        />
      ),
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "ID MLC",
      dataIndex: "id_mlc",
      key: "id_mlc",
    },
    {
      title: "Precio CLP",
      dataIndex: "price_clp",
      key: "price_clp",
      render: (price_clp) =>
        new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(Number(price_clp)),
    },
    {
      title: "Stock MercadoLibre",
      dataIndex: "warehouse_stock",
      key: "warehouse_stock",
    },
    {
      title: "Stock Bodega",
      dataIndex: "warehouse_stock",
      key: "warehouse_stock",
    },
    {
      title: "Fecha Creación",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => new Date(created_at).toLocaleString("es-CL"),
    },
    {
      title: "Fecha Actualización",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at) => new Date(updated_at).toLocaleString("es-CL"),
    },
  ];

  return (
    <Table<Product>
      columns={columns}
      dataSource={products}
      rowKey="id"
      bordered
      pagination={{ pageSize: 5 }}
      size="middle"
    />
  );
};

export default ProductTable;
