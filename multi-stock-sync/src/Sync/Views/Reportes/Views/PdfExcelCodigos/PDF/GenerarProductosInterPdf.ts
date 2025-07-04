import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  date_created: string;
}

export const generarpdfProductosInter = (productos: ProductoML[]): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(70, 130, 180);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de Productos Internacionales", pageWidth / 2, 20, { align: "center" });

  autoTable(doc, {
    startY: 40,
    head: [["ID", "Nombre", "Precio", "Stock", "Estado", "Fecha"]],
    body: productos.map((p) => [
      p.id,
      p.title,
      `$${p.price.toLocaleString()}`,
      p.available_quantity,
      p.status,
      new Date(p.date_created).toLocaleDateString(),
    ]),
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [221, 235, 247],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: { fillColor: [255, 250, 240] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 },
  });

  return doc.output("datauristring");
};
