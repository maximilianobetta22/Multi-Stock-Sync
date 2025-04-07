// VentasPorDia/exportUtilsPorDia.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

interface UserData {
  nickname: string;
}

export const generarPDFPorDia = (
  fecha: string,
  chartData: ChartData,
  totalIngresos: number,
  userData: UserData | null
): string => {
  const doc = new jsPDF();

  // Encabezado visual
  doc.setFillColor(0, 121, 191);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de Ventas por Día", 14, 20);

  // Info del usuario y fecha
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${fecha}`, 14, 40);
  if (userData) {
    doc.text(`Usuario: ${userData.nickname}`, 14, 50);
  }

  doc.text(
    `Total de Ingresos: ${new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(totalIngresos)}`,
    14,
    60
  );

  // Tabla
  autoTable(doc, {
    head: [["Producto", "Ingresos", "Cantidad"]],
    body: chartData.labels.map((label, i) => [
      label,
      new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(chartData.datasets[0].data[i]),
      chartData.datasets[1].data[i],
    ]),
    startY: 70,
    theme: "grid",
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
    align: "center",
  });

  return doc.output("datauristring");
};
