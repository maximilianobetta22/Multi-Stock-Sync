import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generarReporteSemanal = (params: {
  userData: any;
  client_id: string;
  year: string;
  month: string;
  selectedWeek: string;
  chartData: any;
  totalSales: number | null;
  setPdfDataUrl: (url: string) => void;
  setShowModal: (visible: boolean) => void;
}) => {
  const { userData, client_id, year, month, selectedWeek, chartData, totalSales, setPdfDataUrl, setShowModal } = params;

  if (!userData || !userData.nickname) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Encabezado
  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(" Reporte Semanal de Ingresos", pageWidth / 2, 20, { align: "center" });

  // Info del usuario
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  let y = 40;
  doc.text(` Usuario: ${userData.nickname}`, margin, y);
  doc.text(` Año: ${year}`, margin, y += 7);
  doc.text(` Mes: ${month}`, margin, y += 7);
  doc.text(` Semana: ${selectedWeek}`, margin, y += 7);

  if (totalSales !== null) {
    doc.setTextColor(0, 100, 0);
    doc.text(` Total de Ingresos: $${totalSales.toLocaleString()}`, margin, y += 10);
    doc.setTextColor(40, 40, 40);
  }

  autoTable(doc, {
    startY: y + 10,
    head: [["Producto", "Ingresos Totales", "Cantidad Vendida"]],
    body: chartData.labels.map((label: string, index: number) => [
      label,
      `$${Number(chartData.datasets[0].data[index]).toLocaleString()}`,
      chartData.datasets[1].data[index]
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [221, 235, 247],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: [255, 250, 240],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
    },
    margin: { left: margin, right: margin }
  });

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(180);
  doc.text("Multi Stock Sync - Reporte generado automáticamente", pageWidth / 2, pageHeight - 10, { align: "center" });

  const pdfData = doc.output("datauristring");
  const filename = `ReporteIngresosSemana_${client_id}_${userData.nickname}.pdf`;
  setPdfDataUrl(pdfData);
  setShowModal(true);
  doc.save(filename);
};
