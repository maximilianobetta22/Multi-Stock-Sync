import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNumber } from "../helpers/formatNumber";
import { Categoria } from "../Interfaces/interfaces";

export const exportToPdf = (categorias: Categoria[] = []) => {
  if (!Array.isArray(categorias) || categorias.length === 0) {
    console.error("No hay datos para exportar a PDF");
    return;
  }

  const doc = new jsPDF();
  doc.text("Reporte de Ingresos por Categoría", 14, 10);

  const tableData: any = [];
  categorias.forEach((categoria) => {
    tableData.push([
      categoria.category?.toUpperCase() || "Sin categoría",
      "-", 
      categoria.cantidadProductos || 0,
      formatNumber(categoria.total || 0),
      formatNumber(categoria.total || 0)
    ]);
    categoria.productos?.forEach((producto) => {
      tableData.push([
        producto.title || "Sin nombre",
        "-",
        producto.quantity || 0,
        formatNumber(producto.price || 0),
        formatNumber((producto.price || 0) * (producto.quantity || 0))
      ]);
    });
  });

  autoTable(doc, {
    head: [["Tipo de producto", "Documento", "Cantidad", "Subtotal", "Total"]],
    body: tableData,
    startY: 20,
  });
  const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

  doc.save("ingresos_productos.pdf");
};


