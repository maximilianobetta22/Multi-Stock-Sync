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
 * Genera el PDF de Historial de Despachos.
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
  const margin = 14;

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Historial de Despachos – SKU: ${sku}`,
    pageWidth / 2,
    16,
    { align: "center" }
  );

  // Tabla
  autoTable(doc, {
    startY: 24,
    head: [["Estado", "Fecha", "Cant.", "ID Cliente"]],
    body: data.map((d) => [
      d.status,
      d.date_shipped,
      d.total_items.toString(),
      d.customer_id.toString(),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [221, 235, 247],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },
    margin: { left: margin, right: margin },
  });

  // Pie de página
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    "Multi Stock Sync – Generado automáticamente",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  // Acción final
  if (download) {
    doc.save(`HistorialDespacho_${sku}.pdf`);
    return;
  }

  const dataUri = doc.output("datauristring");
  setPdfDataUrl(dataUri);
  setShowModal(true);
};
