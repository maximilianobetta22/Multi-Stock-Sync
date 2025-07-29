import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface DispatchData {
  shipping_id: number;
  status: string;
  tracking_number: string;
  date_shipped: string;
  total_items: number;
  customer_id: number;
}

type PdfParams = {
  data: DispatchData[];
  sku: string;
  client_id: string;
  /** Recibe un dataURI para previsualizar en un <iframe> */
  setPdfDataUrl: (url: string) => void;
  /** Controla la visibilidad del modal */
  setShowModal: (v: boolean) => void;
  /** Si es true, descarga inmediatamente el PDF y NO abre modal */
  download?: boolean;
};

/**
 * Genera el PDF de Historial de Despachos
 * - Si download = true hace doc.save() y cierra.
 * - Si download = false genera un dataURI, lo almacena y abre modal.
 */
export const generarHistorialDespachoPdf = ({
  data,
  sku,
  setPdfDataUrl,
  setShowModal,
  download = false,
}: PdfParams) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  const addHeader = () => {
    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(
      `Historial de Despachos – SKU: ${sku}`,
      pageWidth / 2,
      25,
      { align: "center" }
    );

    // Línea divisoria
    doc.setDrawColor(200);
    doc.line(margin, 32, pageWidth - margin, 32);
  };
  
  const addFooter = () => {
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Línea divisoria
        doc.setDrawColor(200);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

        // Texto del pie de página
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerTextLeft = "Crazy Family - Software de Gestión";
        const footerTextRight = `Página ${i} de ${pageCount}`;
        const generationDate = `Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

        doc.text(footerTextLeft, margin, pageHeight - 10);
        doc.text(generationDate, pageWidth/2, pageHeight - 10, { align: 'center' });
        doc.text(footerTextRight, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  };

  // Tabla
  autoTable(doc, {
    head: [["Estado", "Fecha", "Cant.", "ID Cliente"]],
    body: data.map((d) => [
      d.status,
      d.date_shipped,
      d.total_items.toString(),
      d.customer_id.toString(),
    ]),
    theme: "grid",
    didDrawPage: () => {
        addHeader();
    },
    headStyles: {
      fillColor: [23, 37, 84],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 40, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 'auto', halign: 'center' },
    },
    margin: { top: 38, left: margin, right: margin, bottom: 25 },
  });
  addFooter();

  // Acción final
  if (download) {
    doc.save(`HistorialDespacho_${sku}.pdf`);
    return;
  }

  // Mostrar el modal
  const dataUri = doc.output("datauristring");
  setPdfDataUrl(dataUri);
  setShowModal(true);
};
