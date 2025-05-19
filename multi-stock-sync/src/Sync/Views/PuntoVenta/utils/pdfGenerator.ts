import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bwipjs from 'bwip-js';
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

export const generateSaleDocumentPdf = async (
    sale: VentaResponse,
    documentType: 'boleta' | 'factura',
    cliente: ClienteAPI | undefined,
    items: ParsedSaleItem[],
    facturaData?: { razonSocial: string; rut: string }
): Promise<Blob> => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    // --- BOLETA SII COMPACTA ---
  if (documentType === 'boleta') {
        // Caja principal
        const boxWidth = 340;
        const boxX = (pageWidth - boxWidth) / 2;
        let boxY = y;
        doc.setDrawColor(0);
        doc.setLineWidth(1.2);
        doc.rect(boxX, boxY, boxWidth, 90);

        let yBox = boxY + 22;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('R.U.T.: 77913512-8', boxX + boxWidth / 2, yBox, { align: 'center' });
        yBox += 18;
        doc.text('BOLETA ELECTRÓNICA', boxX + boxWidth / 2, yBox, { align: 'center' });
        yBox += 18;
        doc.setFontSize(11);
        doc.text(`N° ${sale.id}`, boxX + boxWidth / 2, yBox, { align: 'center' });

        // --- SII, ciudad, fecha ---
        y = boxY + 100;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('S.I.I. - SANTIAGO', pageWidth / 2, y, { align: 'center' });
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.text(`Emisión : ${sale.created_at ? new Date(sale.created_at).toLocaleDateString('es-CL') : 'N/A'}`, pageWidth / 2, y, { align: 'center' });

        // --- Empresa y cliente ---
        y += 18;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('COMERCIALIZADORA OFERTAS IMPERDIBLES SPA.', pageWidth / 2, y, { align: 'center' });
        y += 13;
        doc.setFont('helvetica', 'normal');
        doc.text('GIRO: VENTA AL POR MENOR', pageWidth / 2, y, { align: 'center' });
        y += 13;
        doc.text('DIRECCIÓN: JOSE JOAQUÍN PRIETO 6242, San Miguel, Metropolitana', pageWidth / 2, y, { align: 'center' });
        y += 13;
        doc.text('TELÉFONO: +56 9 7702 2449', pageWidth / 2, y, { align: 'center' });

        // --- Tabla productos centrada ---
        y += 18;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        // Usar boxX como base para centrar columnas
        doc.text('Item', boxX + 10, y);
        doc.text('P. unitario', boxX + 120, y);
        doc.text('Cant.', boxX + 210, y);
        doc.text('Total item', boxX + 280, y);

        y += 8;
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(boxX + 10, y, boxX + boxWidth - 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y += 15;
        items.forEach((item) => {
            doc.text(item.nombre, boxX + 10, y);
            doc.text(`${Number(item.precioUnitario).toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, boxX + 120, y, { align: 'left' });
            doc.text(`${item.cantidad}`, boxX + 210, y, { align: 'left' });
            doc.text(`${Number(item.total).toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, boxX + 280, y, { align: 'left' });
            y += 15;
        });

        // --- Total centrado (solo sale.price_final, no suma de la tabla) ---
        y += 8;
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(boxX + 10, y, boxX + boxWidth - 10, y);

        y += 18;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Total $ : ${Number(sale.price_final ?? 0).toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, pageWidth / 2, y, { align: 'center' });

        // --- Código PDF417 ---
        y += 30;
        try {
            const dataForPdf417 = `RUT_EMPRESA=77913512-8|FOLIO=${sale.id}|FECHA=${sale.created_at ? new Date(sale.created_at).toISOString().split('T')[0] : ''}|MONTO=${sale.price_final ?? 0}`;
            const canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, {
                bcid: 'pdf417',
                text: dataForPdf417,
                scale: 2,
                height: 20,
                includetext: false
            });
            const pdf417DataUrl = canvas.toDataURL('image/png');
            const pdf417Height = 70;
            const pdf417Width = 300;
            doc.addImage(
                pdf417DataUrl,
                'PNG',
                (pageWidth - pdf417Width) / 2,
                y,
                pdf417Width,
                pdf417Height
            );
            y += pdf417Height + 10;
        } catch (error) {
            console.error("Error al generar el código PDF417:", error);
        }

        // --- Timbre y resolución ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Timbre Electrónico SII', pageWidth / 2, y, { align: 'center' });
        y += 12;
        doc.text('Resolución 0 de 2019', pageWidth / 2, y, { align: 'center' });
        y += 12;
        doc.text('Verifique documento: desarrollo.libredte.cl/boletas', pageWidth / 2, y, { align: 'center' });

    } else {
        // --- FACTURA ESTILO SII ---
        // Caja principal
        const boxWidth = pageWidth - margin * 2;
        let yBox = margin;
        doc.setDrawColor(0);
        doc.setLineWidth(1.2);
        doc.rect(margin, yBox, boxWidth, pageHeight - margin * 2);

        // Encabezado superior derecho (RUT, tipo, folio)
        doc.setDrawColor(0);
        doc.setLineWidth(1.2);
        doc.rect(pageWidth - margin - 180, yBox, 180, 70);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 0, 0);
        doc.text('R.U.T.: 77913512-8', pageWidth - margin - 90, yBox + 18, { align: 'center' });
        doc.text('FACTURA ELECTRONICA', pageWidth - margin - 90, yBox + 36, { align: 'center' });
        doc.text(`N° ${sale.id}`, pageWidth - margin - 90, yBox + 54, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Logo y datos empresa
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('COMERCIALIZADORA OFERTAS IMPERDIBLES SPA.', margin, yBox + 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('GIRO: VENTA AL POR MENOR', margin, yBox + 34);
        doc.text('DIRECCIÓN: JOSE JOAQUÍN PRIETO 6242, San Miguel, Metropolitana', margin, yBox + 48);
        doc.text('TELÉFONO: +56 9 7702 2449', margin, yBox + 62);

        // Datos cliente
        let yCliente = yBox + 80;
        doc.setFont('helvetica', 'bold');
        doc.text('Señores:', margin, yCliente);
        doc.setFont('helvetica', 'normal');
        doc.text(`${facturaData?.razonSocial || cliente?.razon_social || ''}`, margin + 70, yCliente);
        yCliente += 14;
        doc.setFont('helvetica', 'bold');
        doc.text('RUT:', margin, yCliente);
        doc.setFont('helvetica', 'normal');
        doc.text(`${facturaData?.rut || cliente?.rut || ''}`, margin + 70, yCliente);
        yCliente += 14;
        doc.setFont('helvetica', 'bold');
        doc.text('Giro:', margin, yCliente);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cliente?.giro || ''}`, margin + 70, yCliente);
        yCliente += 14;
        doc.setFont('helvetica', 'bold');
        doc.text('Dirección:', margin, yCliente);
        doc.setFont('helvetica', 'normal');
        const dir = [cliente?.direccion, cliente?.comuna, cliente?.ciudad, cliente?.region].filter(Boolean).join(', ');
        doc.text(dir, margin + 70, yCliente);
        yCliente += 14;
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha Emisión:', margin, yCliente);
        doc.setFont('helvetica', 'normal');
        doc.text(`${sale.created_at ? new Date(sale.created_at).toLocaleDateString('es-CL') : 'N/A'}`, margin + 90, yCliente);

        // Tabla productos
        let yTable = yCliente + 20;
        const tableColumns = [
            { header: 'CÓDIGO', dataKey: 'codigo' },
            { header: 'DESCRIPCIÓN', dataKey: 'nombre' },
            { header: 'CANTIDAD', dataKey: 'cantidad' },
            { header: 'PRECIO', dataKey: 'precioUnitario' },
            { header: 'VALOR', dataKey: 'total' },
        ];
        const tableRows = items.map((item, idx) => ({
            codigo: String(item.id || idx + 1).padStart(4, '0'),
            nombre: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: Number(item.precioUnitario).toLocaleString('es-CL', { minimumFractionDigits: 0 }),
            total: Number(item.total).toLocaleString('es-CL', { minimumFractionDigits: 0 }),
        }));

        (doc as any).autoTable({
            startY: yTable,
            head: [tableColumns.map(col => col.header)],
            body: tableRows.map(row => [
                row.codigo,
                row.nombre,
                row.cantidad,
                row.precioUnitario,
                row.total
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [230, 230, 230],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle'
            },
            bodyStyles: {
                fontSize: 10,
                halign: 'left',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.5
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 60 },
                1: { halign: 'left', cellWidth: 180 },
                2: { halign: 'right', cellWidth: 60 },
                3: { halign: 'right', cellWidth: 80 },
                4: { halign: 'right', cellWidth: 80 }
            },
            margin: { left: margin, right: margin },
            styles: { overflow: 'linebreak', cellPadding: 6 }
        });

        // Totales a la derecha
        const total = Number(sale.price_final ?? 0);
        const neto = Math.round(total / 1.19);
        const iva = total - neto;

        let yTotales = (doc as any).lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('MONTO NETO', pageWidth - margin - 120, yTotales, { align: 'left' });
        doc.text(`$${neto.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, pageWidth - margin, yTotales, { align: 'right' });
        yTotales += 14;
        doc.text('I.V.A. 19%', pageWidth - margin - 120, yTotales, { align: 'left' });
        doc.text(`$${iva.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, pageWidth - margin, yTotales, { align: 'right' });
        yTotales += 14;
        doc.setFontSize(12);
        doc.text('TOTAL $', pageWidth - margin - 120, yTotales, { align: 'left' });
        doc.text(`$${total.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`, pageWidth - margin, yTotales, { align: 'right' });

        // Código PDF417
        let yCode = yTotales + 30;
        try {
            const dataForPdf417 = `RUT_EMPRESA=77913512-8|FOLIO=${sale.id}|FECHA=${sale.created_at ? new Date(sale.created_at).toISOString().split('T')[0] : ''}|MONTO=${sale.price_final ?? 0}`;
            const canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, {
                bcid: 'pdf417',
                text: dataForPdf417,
                scale: 2,
                height: 20,
                includetext: false
            });
            const pdf417DataUrl = canvas.toDataURL('image/png');
            const pdf417Height = 70;
            const pdf417Width = 300;
            const pdf417X = margin + ((boxWidth - pdf417Width) / 2);

            doc.addImage(
                pdf417DataUrl,
                'PNG',
                pdf417X,
                yCode,
                pdf417Width,
                pdf417Height
            );
            yCode += pdf417Height + 10;
        } catch (error) {
            console.error("Error al generar el código PDF417:", error);
        }

        // Timbre y resolución
        const centerX = margin + (boxWidth / 2);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Timbre Electrónico SII', centerX, yCode, { align: 'center' });
        yCode += 12;
        doc.text('Res.0 de 2019 Verifique documento: www.sii.cl', centerX, yCode, { align: 'center' });

        // Pie de página legal
        const boxBottom = pageHeight - margin;
        let yPie = boxBottom - 80; 

        doc.setFontSize(8);
        doc.text('NOMBRE: ______________________   R.U.T.: _______________   FECHA: ___________   RECINTO: ___________', margin, yPie);
       
        yPie += 40;
        doc.text('FIRMA: _______________________________________________', margin, yPie);
        yPie += 10;
        doc.text('El cedente declara que los bienes o servicios entregados han sido recibidos.', margin, yPie);
        doc.setTextColor(200, 0, 0);
        doc.text('CEDIBLE', pageWidth - 10, pageHeight - 10, { align: 'right' });
        doc.setTextColor(0, 0, 0);
    }

    // --- Descargar y retornar Blob ---
    const pdfBlob = doc.output('blob');
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