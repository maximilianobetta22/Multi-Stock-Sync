// Utilidades para exportar reportes de VentasPorMes
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Venta {
  order_id: number;
  title: string;
  quantity: number;
  price: number;
}

// Genera una vista previa en base64 (PDF embebido en iframe)
export const generarPDFPorMes = (
  ventas: Venta[],
  year: number,
  month: number,
  userName: string,
  totalVentas: number,
  formatCLP: (value: number) => string
): string => {
  const doc = new jsPDF();

  // Encabezado visual del PDF
  doc.setFillColor(0, 121, 191);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de Ventas por Mes", 14, 20);

  // Información del período y usuario
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${year}-${month.toString().padStart(2, '0')}`, 14, 40);
  if (userName) doc.text(`Usuario: ${userName}`, 14, 50);

  // Total general
  doc.text(`Total de Ventas: ${formatCLP(totalVentas)}`, 14, 60);
  doc.setTextColor(34, 139, 34); // verde

  // Tabla con productos vendidos
  autoTable(doc, {
    head: [["ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"]],
    body: ventas.map((venta) => [
      venta.order_id.toString(),
      venta.title,
      venta.quantity,
      formatCLP(venta.price)
    ]),
    startY: 70,
    theme: "grid"
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

  return doc.output("datauristring"); // Retorna base64 para vista previa
};

// Genera y descarga el PDF directamente
export const guardarPDFPorMes = (
  ventas: Venta[],
  year: number,
  month: number,
  userName: string,
  totalVentas: number,
  formatCLP: (value: number) => string
) => {
  const doc = new jsPDF();

  // Encabezado y contenido (idéntico al anterior)
  doc.setFillColor(0, 121, 191);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de Ventas por Mes", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${year}-${month.toString().padStart(2, '0')}`, 14, 40);
  if (userName) doc.text(`Usuario: ${userName}`, 14, 50);

  doc.text(`Total de Ventas: ${formatCLP(totalVentas)}`, 14, 60);
  doc.setTextColor(34, 139, 34);

  autoTable(doc, {
    head: [["ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"]],
    body: ventas.map((venta) => [
      venta.order_id.toString(),
      venta.title,
      venta.quantity,
      formatCLP(venta.price)
    ]),
    startY: 70,
    theme: "grid"
  });

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

  // Descarga inmediata con nombre personalizado
  doc.save(`VentasPor${year}-${month.toString().padStart(2, '0')}_${userName}.pdf`);
};

// Exporta a archivo Excel usando XLSX
export const exportarExcelPorMes = (
  ventas: Venta[],
  year: number,
  month: number,
  userName: string,
  formatCLP: (value: number) => string
) => {
  const worksheetData = [
    ["ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"],
    ...ventas.map((venta) => [
      venta.order_id.toString(),
      venta.title,
      venta.quantity,
      formatCLP(venta.price)
    ])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VentasPorMes");

  worksheet["!cols"] = [
    { wch: 30 }, // ID
    { wch: 30 }, // Nombre del producto
    { wch: 20 }, // Cantidad
    { wch: 20 }  // Precio
  ];

  // Nombre dinámico de archivo
  const fileName = `VentasPor${year}-${month.toString().padStart(2, '0')}_${userName}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
