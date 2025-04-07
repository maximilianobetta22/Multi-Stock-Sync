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

// Genera un PDF en base64 para vista previa
export const generarPDFPorYear = (
  ventas: Mes[],
  year: string,
  userName: string
): string => {
  const total = ventas.reduce((acc, mes) => acc + mes.total_sales, 0);
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Ventas Por Año", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Año: ${year}`, 14, 30);
  doc.text(`Usuario: ${userName}`, 14, 40);

  autoTable(doc, {
    startY: 50,
    head: [["Mes", "Ventas Totales", "Productos Vendidos"]],
    body: ventas.map((mes) => [
      mes.month,
      `$ ${new Intl.NumberFormat("es-CL").format(mes.total_sales)} CLP`,
      mes.sold_products
        .map((prod) => `${prod.title}: ${prod.quantity}`)
        .join("\n")
    ]),
    foot: [
      [
        "",
        "Total Ventas:",
        `$ ${new Intl.NumberFormat("es-CL").format(total)} CLP`
      ]
    ],
    didDrawPage: () => {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
        align: "center"
      });
    }
  });

  return doc.output("datauristring");
};

// Guarda el PDF directamente
export const guardarPDFPorYear = (
  ventas: Mes[],
  year: string,
  userName: string
) => {
  const pdfUri = generarPDFPorYear(ventas, year, userName);
  const link = document.createElement("a");
  link.href = pdfUri;
  link.download = `VentasPor${year}_${userName}.pdf`;
  link.click();
};

// Exporta los datos a un archivo Excel
export const exportarExcelPorYear = (
  ventas: Mes[],
  year: string,
  userName: string
) => {
  const worksheetData = [
    ["Mes", "ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"],
    ...ventas.flatMap((mes) =>
      mes.sold_products.map((producto, index) => [
        index === 0 ? mes.month : "",
        producto.order_id.toString(),
        producto.title,
        producto.quantity,
        `$ ${new Intl.NumberFormat("es-CL").format(producto.price)} CLP`
      ])
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VentasPorYear");

  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 }
  ];

  const fileName = `VentasPor${year}_${userName}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
