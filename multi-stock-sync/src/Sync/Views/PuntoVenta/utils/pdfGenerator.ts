// PuntoVenta/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Importar interfaces necesarias
import { VentaResponse } from '../Types/ventaTypes';
import { ClienteAPI } from '../Hooks/ClientesVenta';

interface ParsedSaleItem {
    key: string;
    id?: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

/**
 * Genera un PDF de Boleta o Factura para una venta con diseño mejorado.
 * Utiliza los datos completos de VentaResponse y ClienteAPI.
 * @param sale - Los datos completos de la venta (VentaResponse).
 * @param documentType - El tipo de documento a generar ('boleta' o 'factura').
 * @param cliente - Los datos del cliente asociado (ClienteAPI | undefined).
 * @param items - Los ítems de la venta parseados (ParsedSaleItem[]).
 * @param facturaData - Datos adicionales para facturas (razonSocial, rut).
 * @returns Una Promise que resuelve con un Blob que contiene el PDF generado.
 */
export const generateSaleDocumentPdf = async ( 
    sale: VentaResponse,
    documentType: 'boleta' | 'factura',
    cliente: ClienteAPI | undefined,
    items: ParsedSaleItem[],
    facturaData?: { razonSocial: string; rut: string }
): Promise<Blob> => { // Especificar que devuelve una Promise<Blob>
    const doc = new jsPDF('p', 'pt', 'a4');

    if (documentType === 'factura' && facturaData) {
        console.log('Generando factura con datos:', facturaData);
        // Puedes usar facturaData para agregar información al PDF
        doc.setFontSize(10);
        doc.text(`Razón Social: ${facturaData.razonSocial}`, 40, 100);
        doc.text(`RUT: ${facturaData.rut}`, 40, 120);
    }

    const margin = 40;
    let y = margin; // Start Y position below top margin
    const lineHeight = 16;
    const largeLineHeight = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    const drawLine = (startY: number, length: number = pageWidth - 2 * margin, startX: number = margin) => {
        doc.line(startX, startY, startX + length, startY);
    };

    // --- Cabecera del documento ---

    // Bloque de Información de la Empresa (Izquierda)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMERCIALIZADORA OFERTAS IMPERDIBLES SPA.', margin, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`RUT: [77913512-8]`, margin, y);
    y += lineHeight;
    doc.text(`Dirección: [JOSE JOAQUÍN PRIETO 6242]`, margin, y);
    y += lineHeight;
    doc.text(`Comuna: [San Miguel] - Región: [Metropolitana]`, margin, y);
    y += lineHeight;
    doc.text(`Teléfono: [+56 9 7702 2449]`, margin, y);
    y += lineHeight;
    doc.text(`Email: [ventas@ofertasimperdibles.cl]`, margin, y);
    // y is now after the company info block

    // Bloque de Título del Documento y Folio (Derecha)
    const docTitle = documentType === 'boleta' ? 'BOLETA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    // Positioned relative to top-right margin, independent of 'y' flow on the left
    doc.text(docTitle, pageWidth - margin, margin, { align: 'right' });

    // Folio del documento (Debajo del título, a la derecha)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${sale.id}`, pageWidth - margin, margin + largeLineHeight * 0.8, { align: 'right' });


    // Advance y to be below the lowest element in the header section
    y = Math.max(y, margin + largeLineHeight * 2); // Ensure y is at least below the right-aligned title block
    drawLine(y); // Line after header
    y += largeLineHeight;


    // --- Detalles de la Venta y Cliente ---

    // Detalles de la Venta (Fecha)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Emisión:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}`, margin + 90, y);
    y += lineHeight * 1.5;


    // Detalles del Cliente (Usando datos de ClienteAPI)
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Cliente:', margin, y);
    y += largeLineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const clientName = cliente?.nombres && cliente?.apellidos
        ? `${cliente.nombres} ${cliente.apellidos}`
        : (cliente?.razon_social || 'N/A');
    const clientIdentifierLabel = documentType === 'factura' ? 'Razón Social:' : 'Nombre:';
    const clientIdentifierValue = documentType === 'factura' ? cliente?.razon_social || 'N/A' : clientName;

    doc.setFont('helvetica', 'bold');
    doc.text(clientIdentifierLabel, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${clientIdentifierValue}`, margin + 90, y);
    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('RUT:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cliente?.rut || 'N/A'}`, margin + 90, y);
    y += lineHeight;

    if (cliente?.direccion || cliente?.comuna || cliente?.ciudad || cliente?.region) {
        doc.setFont('helvetica', 'bold');
        doc.text('Dirección:', margin, y);
        doc.setFont('helvetica', 'normal');
        const fullAddress = `${cliente.direccion || ''}${cliente.direccion && (cliente.comuna || cliente.ciudad || cliente.region) ? ', ' : ''}${cliente.comuna || ''}${cliente.comuna && (cliente.ciudad || cliente.region) ? ', ' : ''}${cliente.ciudad || ''}${cliente.ciudad && cliente.region ? ', ' : ''}${cliente.region || ''}`;
        doc.text(fullAddress || 'N/A', margin + 90, y);
        y += lineHeight;
    }

    if (documentType === 'factura' && cliente?.giro) {
        doc.setFont('helvetica', 'bold');
        doc.text('Giro:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cliente.giro}`, margin + 90, y);
        y += lineHeight;
    }

    y += largeLineHeight;

    drawLine(y); 
    y += lineHeight;


    // --- Tabla de Ítems ---
    const tableColumns = [
        { header: 'Producto', dataKey: 'nombre' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'P. Unitario', dataKey: 'precioUnitario' },
        { header: 'Total', dataKey: 'total' },
    ];

    const tableRows = items.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        total: item.total,
    }));

    const autoTableOptions: any = {
        startY: y,
        theme: 'grid',
        styles: {
            overflow: 'linebreak',
            fontSize: 9,
            cellPadding: 6,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
        },
        headStyles: {
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
        },
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        columnStyles: {
            cantidad: { halign: 'right', cellWidth: 60 },
            precioUnitario: { halign: 'right', cellWidth: 80, format: (value: number) => `$${value?.toFixed(2).replace(/\.00$/, '') || '0'}` },
            total: { halign: 'right', cellWidth: 80, format: (value: number) => `$${value?.toFixed(2).replace(/\.00$/, '') || '0'}` },
            nombre: { cellWidth: 'auto' }
        },
        bodyStyles: {
            halign: 'left',
            fontSize: 9,
        },
        didDrawPage: (data: any) => {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const pageNumber = data.pageNumber;
            const footerY = pageHeight - margin / 2;
            doc.text('[Resolución Exenta N°11  / Comercializadora SPA]', margin, footerY); // TODO: Añadir info real
            doc.text(`Página ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
        },
    };


    (doc as any).autoTable(tableColumns, tableRows, autoTableOptions);
    y = (doc as any).autoTable.previous.finalY || y;


    let yAfterTable = y + largeLineHeight;


    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, pageWidth - margin - 100, yAfterTable, { align: 'left' });
    doc.text(`$${sale.price_subtotal?.toFixed(2).replace(/\.00$/, '') || '0'}`, pageWidth - margin, yAfterTable, { align: 'right' });
    yAfterTable += lineHeight;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL:`, pageWidth - margin - 100, yAfterTable + lineHeight * 0.5, { align: 'left' });
    doc.text(`$${sale.price_final?.toFixed(2).replace(/\.00$/, '') || '0'}`, pageWidth - margin, yAfterTable + lineHeight * 0.5, { align: 'right' });


    y = yAfterTable + largeLineHeight;


    // --- Observaciones ---

    if (sale.observation) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        
        doc.text('Observaciones:', margin, y);
        doc.setFont('helvetica', 'normal');
        const observationText = doc.splitTextToSize(sale.observation, pageWidth - 2 * margin - 100); 
    
        doc.text(observationText, margin + 90, y);

        y += lineHeight * observationText.length + largeLineHeight;
    } else {
      
    }


    // --- Sección de Firma / Sello (Opcional) ---
    let ySignature = y + largeLineHeight;
   
    if (ySignature < pageHeight - margin - largeLineHeight * 3) {
        drawLine(ySignature, 150, pageWidth - margin - 150); 
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Firma y Sello Autorizado', pageWidth - margin - 150 + 75, ySignature + lineHeight, { align: 'center' }); 
      
        y = ySignature + largeLineHeight * 2;
    } else {
        // aca deberia ir else por lo de la firma pero no esta hecho xdd
    }

    // Generar el Blob y retornarlo
    const pdfBlob = doc.output('blob');

    // Opcional: Si quieres que también se descargue automáticamente AL MISMO TIEMPO que se sube:
    const fileName = `${documentType.toUpperCase()}_${sale.id}_${sale.created_at ? new Date(sale.created_at).toLocaleDateString().replace(/\//g, '-') : 'sin-fecha'}.pdf`;
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
     document.body.removeChild(link);
     window.URL.revokeObjectURL(url);


    return pdfBlob; 
};
