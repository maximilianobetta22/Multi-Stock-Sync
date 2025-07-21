import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ProductoVendido {
  order_id: number;
  title: string;
  quantity: number;
  price: number;
}

interface Mes {
  month: string;
  total_sales: number;
  sold_products: ProductoVendido[];
}

interface DetalleVenta {
  key: string;
  mes: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
}

// Constantes para cálculos reales
const IVA_RATE = 0.19; // 19% IVA en Chile

// Funciones de utilidad para cálculos reales (solo datos calculables)
const calcularPrecioNeto = (precioConIva: number): number => {
  return precioConIva / (1 + IVA_RATE);
};

const calcularIVA = (precioNeto: number): number => {
  return precioNeto * IVA_RATE;
};

const redondearPrecio = (precio: number): number => {
  // Redondear a los 10 pesos más cercanos
  return Math.round(precio / 10) * 10;
};

// 🟧 PDF: Ventas por Mes (sin cambios)
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
    head: [["Fecha", "Producto", "Cantidad", "Total"]],
    body: ventas.map((v) => [
      v.date || "Sin Fecha",
      v.title,
      v.quantity,
      formatCLP(v.total_amount || 0),
    ]),
    foot: [
      [
        { content: "Total del Mes", colSpan: 3 },
        formatCLP(totalVentas),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: "striped",
  });

  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
};

// 🟧 PDF: Guardar directo Mes (sin cambios)
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
    head: [["Fecha", "Producto", "Cantidad", "Total"]],
    body: ventas.map((v) => [
      v.date || "Sin Fecha",
      v.title,
      v.quantity,
      formatCLP(v.total_amount || 0),
    ]),
    foot: [
      [
        { content: "Total del Mes", colSpan: 3 },
        formatCLP(totalVentas),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: "striped",
  });

  doc.save(`Ventas_Mes_${userName}_${fecha}.pdf`);
};

// 🟧 Excel: Ventas por Mes - MODIFICADO (sin fecha + título con mes/año)
export const exportarExcelPorMes = (
  ventas: any[],
  year: number,
  month: number,
  userName: string,
  formatCLP: (value: number) => string
): void => {
  // Crear el nombre del mes en español
  const nombreMes = new Date(0, month - 1).toLocaleString('es-CL', { month: 'long' });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  
  // Crear título del reporte
  const tituloReporte = `Reporte de Ventas - ${mesCapitalizado} ${year}`;
  const fechaGeneracion = `Generado el: ${new Date().toLocaleDateString('es-CL')}`;
  const usuario = `Usuario: ${userName}`;

  // Crear datos del worksheet con título y encabezados (SIN columna Fecha)
  const worksheetData = [
    [tituloReporte], // Título principal
    [fechaGeneracion], // Fecha de generación
    [usuario], // Usuario
    [], // Fila vacía para separar
    ["Producto", "Cantidad", "Total"], // Encabezados (sin "Fecha")
    ...ventas.map((venta) => [
      venta.title,
      venta.quantity,
      formatCLP(venta.total_amount),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Configurar el ancho de las columnas
  worksheet['!cols'] = [
    { wch: 60 }, // Producto (más ancho)
    { wch: 15 }, // Cantidad
    { wch: 20 }, // Total
  ];

  // Fusionar celdas para el título (spanning across all columns)
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Título
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Fecha generación
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Usuario
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VentasPorMes");

  const fileName = `VentasMes_${userName}_${month
    .toString()
    .padStart(2, "0")}_${year}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

// 🟨 PDF: Ventas por Día (sin cambios)
export const generarPDFPorDiaBlobURL = (
  fecha: string,
  ventas: any[],
  total: number,
  userData: { nickname: string; profile_image: string },
  formatCLP: (value: number) => string
): string => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Reporte de Ventas por Día - ${fecha}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userData.nickname}`, 10, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Producto", "Cantidad", "Total"]],
    body: ventas.map((v) => [
      v.title,
      v.quantity,
      formatCLP(v.total_amount || 0),
    ]),
    foot: [[{ content: "Total del Día", colSpan: 2 }, formatCLP(total)]],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: "striped",
  });

  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
};

// 🟦 PDF: Ventas por Año - CON DATOS CALCULABLES
export const generarPDFPorYear = (
  salesData: Mes[],
  detalleVentas: DetalleVenta[],
  year: string,
  userName: string
): string => {
  const doc = new jsPDF();
  
  // Calcular totales para el resumen
  const totalVentasConIva = salesData.reduce((acc, mes) => acc + mes.total_sales, 0);
  const totalVentasSinIva = detalleVentas.reduce((acc, item) => {
    const precioNeto = calcularPrecioNeto(item.precioUnitario);
    return acc + (precioNeto * item.cantidad);
  }, 0);
  const totalIvaRecaudado = totalVentasConIva - totalVentasSinIva;
  const cantidadTotalProductos = detalleVentas.reduce((acc, item) => acc + item.cantidad, 0);

  // Encabezado
  doc.setFontSize(16);
  doc.text(`Reporte Anual de Ventas - ${year}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userName}`, 10, 20);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, 10, 30);

  // Resumen Financiero
  doc.setFontSize(14);
  doc.text("RESUMEN FINANCIERO", 10, 45);
  
  autoTable(doc, {
    startY: 55,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total Ventas Sin IVA", `${Math.round(totalVentasSinIva).toLocaleString("es-CL")} CLP`],
      ["Total IVA Recaudado", `${Math.round(totalIvaRecaudado).toLocaleString("es-CL")} CLP`],
      ["Total Ventas Con IVA", `${totalVentasConIva.toLocaleString("es-CL")} CLP`],
      ["Productos Vendidos", `${cantidadTotalProductos} unidades`],
      ["Ticket Promedio", `${Math.round(totalVentasConIva / detalleVentas.length).toLocaleString("es-CL")} CLP`],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Resumen Mensual
  const finalY1 = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(14);
  doc.text("RESUMEN MENSUAL", 10, finalY1 + 15);

  const resumenMensual = salesData.map(mes => {
    const ventasDelMes = detalleVentas.filter(item => item.mes === mes.month);
    const totalSinIvaMes = ventasDelMes.reduce((acc, item) => {
      const precioNeto = calcularPrecioNeto(item.precioUnitario);
      return acc + (precioNeto * item.cantidad);
    }, 0);
    const totalIvaMes = mes.total_sales - totalSinIvaMes;
    
    return [
      mes.month,
      `${Math.round(totalSinIvaMes).toLocaleString("es-CL")}`,
      `${Math.round(totalIvaMes).toLocaleString("es-CL")}`,
      `${mes.total_sales.toLocaleString("es-CL")}`
    ];
  });

  autoTable(doc, {
    startY: finalY1 + 25,
    head: [["Mes", "Sin IVA", "IVA", "Con IVA"]],
    body: resumenMensual,
    foot: [
      [
        "TOTAL",
        `${Math.round(totalVentasSinIva).toLocaleString("es-CL")}`,
        `${Math.round(totalIvaRecaudado).toLocaleString("es-CL")}`,
        `${totalVentasConIva.toLocaleString("es-CL")}`
      ]
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: "striped",
    headStyles: { fillColor: [52, 152, 219] },
    footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold' },
  });

  return doc.output("datauristring");
};

// 🟦 PDF Guardar: Año - CON DATOS CALCULABLES
export const guardarPDFPorYear = (
  salesData: Mes[],
  detalleVentas: DetalleVenta[],
  year: string,
  userName: string
): void => {
  const doc = new jsPDF();
  
  // Calcular totales para el resumen
  const totalVentasConIva = salesData.reduce((acc, mes) => acc + mes.total_sales, 0);
  const totalVentasSinIva = detalleVentas.reduce((acc, item) => {
    const precioNeto = calcularPrecioNeto(item.precioUnitario);
    return acc + (precioNeto * item.cantidad);
  }, 0);
  const totalIvaRecaudado = totalVentasConIva - totalVentasSinIva;
  const cantidadTotalProductos = detalleVentas.reduce((acc, item) => acc + item.cantidad, 0);

  // Encabezado
  doc.setFontSize(16);
  doc.text(`Reporte Anual de Ventas - ${year}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userName}`, 10, 20);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, 10, 30);

  // Resumen Financiero
  doc.setFontSize(14);
  doc.text("RESUMEN FINANCIERO", 10, 45);
  
  autoTable(doc, {
    startY: 55,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total Ventas Sin IVA", `${Math.round(totalVentasSinIva).toLocaleString("es-CL")} CLP`],
      ["Total IVA Recaudado", `${Math.round(totalIvaRecaudado).toLocaleString("es-CL")} CLP`],
      ["Total Ventas Con IVA", `${totalVentasConIva.toLocaleString("es-CL")} CLP`],
      ["Productos Vendidos", `${cantidadTotalProductos} unidades`],
      ["Ticket Promedio", `${Math.round(totalVentasConIva / detalleVentas.length).toLocaleString("es-CL")} CLP`],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Resumen Mensual
  const finalY1 = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(14);
  doc.text("RESUMEN MENSUAL", 10, finalY1 + 15);

  const resumenMensual = salesData.map(mes => {
    const ventasDelMes = detalleVentas.filter(item => item.mes === mes.month);
    const totalSinIvaMes = ventasDelMes.reduce((acc, item) => {
      const precioNeto = calcularPrecioNeto(item.precioUnitario);
      return acc + (precioNeto * item.cantidad);
    }, 0);
    const totalIvaMes = mes.total_sales - totalSinIvaMes;
    
    return [
      mes.month,
      `${Math.round(totalSinIvaMes).toLocaleString("es-CL")}`,
      `${Math.round(totalIvaMes).toLocaleString("es-CL")}`,
      `${mes.total_sales.toLocaleString("es-CL")}`
    ];
  });

  autoTable(doc, {
    startY: finalY1 + 25,
    head: [["Mes", "Sin IVA", "IVA", "Con IVA"]],
    body: resumenMensual,
    foot: [
      [
        "TOTAL",
        `${Math.round(totalVentasSinIva).toLocaleString("es-CL")}`,
        `${Math.round(totalIvaRecaudado).toLocaleString("es-CL")}`,
        `${totalVentasConIva.toLocaleString("es-CL")}`
      ]
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: "striped",
    headStyles: { fillColor: [52, 152, 219] },
    footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold' },
  });

  doc.save(`Reporte_Ventas_${userName}_${year}.pdf`);
};

// 🟦 Excel Mejorado: Año - SOLO CON DATOS REALES CALCULABLES
export const exportarExcelPorYear = (
  salesData: Mes[],
  detalleVentas: DetalleVenta[],
  year: string,
  userName: string
): void => {
  // Procesar datos con cálculos reales únicamente
  const detalleCalculado = detalleVentas.map(item => {
    // Valores base reales
    const precioConIva = item.precioUnitario;
    const cantidad = item.cantidad;
    
    // Cálculos reales (solo datos calculables)
    const precioNeto = calcularPrecioNeto(precioConIva);
    const ivaUnitario = calcularIVA(precioNeto);
    const ivaTotal = ivaUnitario * cantidad;
    const totalSinIva = precioNeto * cantidad;
    const totalConIva = precioConIva * cantidad;
    
    return {
      "Mes": item.mes,
      "Producto": item.producto,
      "Cantidad": cantidad,
      "Precio Unitario (Con IVA)": Math.round(precioConIva),
      "Precio Neto Unitario": Math.round(precioNeto),
      "IVA Unitario": Math.round(ivaUnitario),
      "Total Sin IVA": Math.round(totalSinIva),
      "Total IVA": Math.round(ivaTotal),
      "Total Con IVA": Math.round(totalConIva)
    };
  });

  // Crear resumen con totales reales
  const totalVentasConIva = salesData.reduce((acc, mes) => acc + mes.total_sales, 0);
  const totalVentasSinIva = detalleCalculado.reduce((acc, item) => acc + item["Total Sin IVA"], 0);
  const totalIvaRecaudado = detalleCalculado.reduce((acc, item) => acc + item["Total IVA"], 0);

  const resumenFinanciero = [
    { "Métrica": "Total Ventas Sin IVA ", "Valor": totalVentasSinIva },
    { "Métrica": "Total IVA Recaudado ", "Valor": totalIvaRecaudado },
    { "Métrica": "Total Ventas Con IVA ", "Valor": totalVentasConIva },
    { "Métrica": "Cantidad Total Productos Vendidos", "Valor": detalleCalculado.reduce((acc, item) => acc + item.Cantidad, 0) },
    { "Métrica": "Ticket Promedio (Con IVA)", "Valor": Math.round(totalVentasConIva / detalleCalculado.length) }
  ];

  // Resumen mensual
  const resumenMensual = salesData.map(mes => {
    const ventasDelMes = detalleCalculado.filter(item => item.Mes === mes.month);
    const totalSinIvaMes = ventasDelMes.reduce((acc, item) => acc + item["Total Sin IVA"], 0);
    const totalIvaMes = ventasDelMes.reduce((acc, item) => acc + item["Total IVA"], 0);
    
    return {
      "Mes": mes.month,
      "Ventas Sin IVA ": totalSinIvaMes,
      "IVA Recaudado ": totalIvaMes,
      "Ventas Con IVA ": mes.total_sales
    };
  });

  // Agregar totales al resumen mensual
  resumenMensual.push({
    "Mes": "TOTAL AÑO",
    "Ventas Sin IVA ": totalVentasSinIva,
    "IVA Recaudado ": totalIvaRecaudado,
    "Ventas Con IVA ": totalVentasConIva
  });

  // Crear hojas de trabajo
  const wsResumenGeneral = XLSX.utils.json_to_sheet(resumenFinanciero);
  wsResumenGeneral['!cols'] = [{ wch: 35 }, { wch: 20 }];

  const wsResumenMensual = XLSX.utils.json_to_sheet(resumenMensual);
  wsResumenMensual['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  const wsDetalle = XLSX.utils.json_to_sheet(detalleCalculado);
  wsDetalle['!cols'] = [
    { wch: 12 }, // Mes
    { wch: 50 }, // Producto
    { wch: 10 }, // Cantidad
    { wch: 20 }, // Precio Unitario Con IVA
    { wch: 20 }, // Precio Neto Unitario
    { wch: 15 }, // IVA Unitario
    { wch: 18 }, // Total Sin IVA
    { wch: 15 }, // Total IVA
    { wch: 18 }  // Total Con IVA
  ];

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumenGeneral, "Resumen Financiero");
  XLSX.utils.book_append_sheet(wb, wsResumenMensual, "Resumen Mensual");
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle Completo");

  // Exportar archivo
  XLSX.writeFile(wb, `Reporte_Ventas_Detallado_${userName}_${year}.xlsx`);
};