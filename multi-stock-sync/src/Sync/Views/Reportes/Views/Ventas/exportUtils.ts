import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Reutilizamos la función para formatear CLP
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
};

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

interface UserData {
  nickname: string;
}

export const generarPDFVentas = (
  ventas: Venta[],
  userData: UserData | null,
  yearSeleccionado: number
): string => {
  const doc = new jsPDF();
  doc.setFillColor(0, 121, 191);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de Ventas", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${userData?.nickname}`, 14, 40);
  doc.text(`Ventas del Año: ${yearSeleccionado}`, 14, 50);

  autoTable(doc, {
    head: [["ID", "Fecha", "Producto", "Cantidad", "Precio"]],
    body: ventas.map((venta) => [
      venta.order_id,
      venta.order_date,
      venta.title,
      venta.quantity,
      formatCurrency(venta.price),
    ]),
    startY: 60,
    theme: "grid",
    margin: { bottom: 10 },
  });

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
    align: "center",
  });

  return doc.output("datauristring");
};

export const exportarVentasAExcel = (
  ventas: Venta[],
  yearSeleccionado: number
): void => {
  const worksheetData = [
    ["ID", "Fecha", "Producto", "Cantidad", "Precio"],
    ...ventas.map((venta) => [
      venta.order_id,
      venta.order_date,
      venta.title,
      venta.quantity,
      formatCurrency(venta.price),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

  const fileName = `Ventas_${yearSeleccionado}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
