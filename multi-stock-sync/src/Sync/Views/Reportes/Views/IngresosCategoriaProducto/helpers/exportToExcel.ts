import * as XLSX from "xlsx";

import { Categoria } from "../Interfaces/interfaces";

const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

export const exportToExcel = (categorias: Categoria[] = []) => {
  if (!Array.isArray(categorias) || categorias.length === 0) {
    console.error("No hay datos para exportar a Excel");
    return;
  }

  const data: any[] = [];
  categorias.forEach((categoria) => {
    data.push({
      "Tipo de producto": categoria.category?.toUpperCase() || "Sin categoría",
      Documento: "-",
      Cantidad: categoria.cantidadProductos || 0,
      Subtotal: formatNumber(categoria.total || 0),
      Total: formatNumber(categoria.total || 0)
    });
    categoria.productos?.forEach((producto) => {
      data.push({
        "Tipo de producto": producto.title || "Sin nombre",
        Documento: "-",
        Cantidad: producto.quantity || 0,
        Subtotal: formatNumber(producto.price || 0),
        Total: formatNumber((producto.price || 0) * (producto.quantity || 0))
      });
    });
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
  XLSX.writeFile(workbook, "ingresos_productos.xlsx");
};