// Ventas_Reportes/utils/exportUtils.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// 🟩 Exportar PDF para Ventas por Mes o Tabla
export const exportToPDF = (
  tipo: "mes" | "tabla",
  data: any[],
  year: string,
  month?: string,
  userName?: string,
  descargar?: boolean
): string | void => {
  const doc = new jsPDF();
  const fecha = tipo === "mes" ? `${month}-${year}` : year;

  doc.text(`Reporte de Ventas - ${fecha}`, 10, 10);
  if (userName) doc.text(`Usuario: ${userName}`, 10, 20);

  autoTable(doc, {
    startY: 30,
    head: [["ID", "Producto", "Cantidad", "Precio"]],
    body: data.map((v: any) => [
      v.order_id,
      v.title,
      v.quantity,
      `$${v.price.toLocaleString("es-CL")}`,
    ]),
  });

  if (descargar) {
    doc.save(`Ventas_${fecha}.pdf`);
    return;
  }

  return doc.output("datauristring");
};

// 🟩 Exportar a Excel para Mes o Tabla
export const exportToExcel = (
  tipo: "mes" | "tabla",
  data: any[],
  year: string,
  month?: string,
  userName?: string
): void => {
  const worksheetData = [
    ["ID", "Producto", "Cantidad", "Precio"],
    ...data.map((venta: any) => [
      venta.order_id,
      venta.title,
      venta.quantity,
      venta.price,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

  const nombreArchivo =
    tipo === "mes"
      ? `Ventas_${userName}_${month}_${year}.xlsx`
      : `Ventas_${userName}_${year}.xlsx`;

  XLSX.writeFile(workbook, nombreArchivo);
};

// 🟨 Exportar PDF para Ventas por Día
export const generarPDFPorDia = (
  fecha: string,
  chartData: any,
  total: number,
  userData: { nickname: string; profile_image: string } | null
): string => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Reporte de Ventas - ${fecha}`, 10, 10);
  if (userData) {
    doc.setFontSize(12);
    doc.text(`Usuario: ${userData.nickname}`, 10, 20);
  }

  autoTable(doc, {
    startY: 30,
    head: [["Producto", "Cantidad", "Ingresos"]],
    body: chartData.labels.map((label: string, index: number) => [
      label,
      chartData.datasets[1].data[index],
      `$${chartData.datasets[0].data[index].toLocaleString("es-CL")}`,
    ]),
    foot: [
      [
        { content: "Total del Día", colSpan: 2 },
        `$ ${total.toLocaleString("es-CL")} CLP`,
      ],
    ],
  });

  return doc.output("datauristring");
};

// 🟦 Exportar PDF para Ventas por Año
export const generarPDFPorYear = (
  data: any[],
  year: string,
  userName: string
): string => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Reporte Anual de Ventas - ${year}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userName}`, 10, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Mes", "Ventas Totales"]],
    body: data.map((d) => [
      d.month,
      `$${d.total_sales.toLocaleString("es-CL")}`,
    ]),
  });

  return doc.output("datauristring");
};

export const guardarPDFPorYear = (
  data: any[],
  year: string,
  userName: string
): void => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Reporte Anual de Ventas - ${year}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userName}`, 10, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Mes", "Ventas Totales"]],
    body: data.map((d) => [
      d.month,
      `$${d.total_sales.toLocaleString("es-CL")}`,
    ]),
  });

  doc.save(`Ventas_Anuales_${year}.pdf`);
};

export const exportarExcelPorYear = (
  data: any[],
  year: string,
  userName: string
): void => {
  const worksheetData = [
    ["Mes", "Ventas Totales"],
    ...data.map((d) => [d.month, d.total_sales]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VentasAnuales");

  XLSX.writeFile(workbook, `Ventas_${userName}_${year}.xlsx`);
};
// 🟧 Exportar PDF para Ventas por Mes (vista previa)
export const generarPDFPorMes = (
    ventas: any[],
    year: number,
    month: number,
    userName: string,
    totalVentas: number,
    formatCLP: (value: number) => string
  ): string => {
    const doc = new jsPDF();
    const fecha = `${month.toString().padStart(2, "0")}-${year}`;
  
    doc.setFontSize(16);
    doc.text(`Reporte de Ventas por Mes - ${fecha}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Usuario: ${userName}`, 10, 20);
  
    autoTable(doc, {
      startY: 30,
      head: [["Producto", "Cantidad", "Precio"]],
      body: ventas.map((v) => [v.title, v.quantity, formatCLP(v.price)]),
      foot: [
        [
          { content: "Total del Mes", colSpan: 2 },
          formatCLP(totalVentas),
        ],
      ],
    });
  
    return doc.output("datauristring");
  };
  
  // 🟧 Guardar PDF para Ventas por Mes (descarga directa)
  export const guardarPDFPorMes = (
    ventas: any[],
    year: number,
    month: number,
    userName: string,
    totalVentas: number,
    formatCLP: (value: number) => string
  ): void => {
    const doc = new jsPDF();
    const fecha = `${month.toString().padStart(2, "0")}-${year}`;
  
    doc.setFontSize(16);
    doc.text(`Reporte de Ventas por Mes - ${fecha}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Usuario: ${userName}`, 10, 20);
  
    autoTable(doc, {
      startY: 30,
      head: [["Producto", "Cantidad", "Precio"]],
      body: ventas.map((v) => [v.title, v.quantity, formatCLP(v.price)]),
      foot: [
        [
          { content: "Total del Mes", colSpan: 2 },
          formatCLP(totalVentas),
        ],
      ],
    });
  
    doc.save(`Ventas_Mes_${userName}_${fecha}.pdf`);
  };
// 🟦 Exportar Excel para Ventas por Mes
export const exportarExcelPorMes = (
    ventas: any[],
    year: number,
    month: number,
    userName: string,
    formatCLP: (value: number) => string
  ): void => {
    const worksheetData = [
      ["Producto", "Cantidad", "Precio"],
      ...ventas.map((venta) => [
        venta.title,
        venta.quantity,
        formatCLP(venta.price),
      ]),
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VentasPorMes");
  
    const fileName = `VentasMes_${userName}_${month
      .toString()
      .padStart(2, "0")}_${year}.xlsx`;
  
    XLSX.writeFile(workbook, fileName);
  };
  
