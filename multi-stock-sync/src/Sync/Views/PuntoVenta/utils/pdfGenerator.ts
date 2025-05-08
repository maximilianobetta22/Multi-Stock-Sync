import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importante para que autoTable esté disponible

// Importar interfaces necesarias
import { VentaResponse } from '../Types/ventaTypes';
import { ClienteAPI } from '../Hooks/ClientesVenta'; // Asumiendo que esta es la estructura del cliente

// Definir la interfaz para los ítems parseados (debe coincidir con ParsedSaleItem en EmitirDocumento.tsx)
interface ParsedSaleItem {
    key: string;
    id?: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    // Añadir otras propiedades si vienen en el JSON y las necesitas
}

interface FacturaData {
    razonSocial: string;
    rut: string;
    [key: string]: any; // Para otros campos de factura
}


/**
 * Genera un PDF de Boleta o Factura para una venta.
 * @param sale - Los datos completos de la venta (VentaResponse).
 * @param documentType - El tipo de documento a generar ('boleta' o 'factura').
 * @param cliente - Los datos del cliente asociado (ClienteAPI).
 * @param items - Los ítems de la venta parseados (ParsedSaleItem[]).
 * @param facturaData - Datos adicionales de factura si aplica (FacturaData).
 */
export const generateSaleDocumentPdf = (
    sale: VentaResponse,
    documentType: 'boleta' | 'factura',
    cliente: ClienteAPI | undefined, // Puede que el cliente no siempre esté asociado directamente
    items: ParsedSaleItem[],
    facturaData?: FacturaData // Opcional para boleta
) => {
    // Usar 'pt' (puntos) para unidades, 'a4' para formato
    const doc = new jsPDF('p', 'pt', 'a4');

    // Márgenes y posición inicial
    const margin = 40;
    let y = margin;
    const lineHeight = 14; // Espacio entre líneas de texto

    // --- Cabecera del documento ---
    // Título (Boleta o Factura)
    doc.setFontSize(18);
    doc.text(documentType === 'boleta' ? 'BOLETA' : 'FACTURA', doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += lineHeight * 2;

    // Info de la Empresa (Placeholder)
    doc.setFontSize(12);
    doc.text('Nombre de tu Empresa', margin, y);
    y += lineHeight;
    doc.text('Tu RUT de Empresa', margin, y);
    y += lineHeight;
    doc.text('Tu Dirección de Empresa', margin, y);
    y += lineHeight * 2;


    // --- Detalles de la Venta ---
    doc.setFontSize(10);
    doc.text(`Folio: ${sale.id}`, margin, y);
    y += lineHeight;
    doc.text(`Fecha: ${sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}`, margin, y);
    y += lineHeight * 2;


    // --- Detalles del Cliente ---
    doc.setFontSize(10);
    doc.text('Detalles del Cliente:', margin, y);
    y += lineHeight;

    if (documentType === 'factura' && facturaData) {
         doc.text(`Razón Social: ${facturaData.razonSocial || 'N/A'}`, margin, y);
         y += lineHeight;
         doc.text(`RUT: ${facturaData.rut || 'N/A'}`, margin, y);
         y += lineHeight;
         // Añadir otros campos de factura si los tienes en facturaData
         // doc.text(`Dirección: ${facturaData.direccion || 'N/A'}`, margin, y);
         // y += lineHeight;

    } else if (cliente) { // Mostrar detalles del cliente si es boleta o si no hay facturaData explícita
        doc.text(`Nombre: ${cliente.nombres || cliente.razon_social || 'N/A'}`, margin, y);
        y += lineHeight;
        doc.text(`RUT: ${cliente.rut || 'N/A'}`, margin, y);
        y += lineHeight;
        // Puedes añadir otros datos del cliente si los tienes en ClienteAPI
        // doc.text(`Dirección: ${cliente.address || 'N/A'}`, margin, y);
        // y += lineHeight;

    } else {
         doc.text('Cliente: N/A', margin, y);
         y += lineHeight;
    }
     y += lineHeight;


    // --- Tabla de Ítems ---
    // Define las columnas para autoTable
    const tableColumns = [
        { header: 'Producto', dataKey: 'nombre' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'P. Unitario', dataKey: 'precioUnitario' },
        { header: 'Total', dataKey: 'total' },
    ];

    // Prepara los datos para autoTable
    const tableRows = items.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        // Formatear números para la tabla
        precioUnitario: `$${item.precioUnitario?.toFixed(2).replace(/\.00$/, '') || '0'}`,
        total: `$${item.total?.toFixed(2).replace(/\.00$/, '') || '0'}`,
    }));

    // Configuración para autoTable
    const autoTableOptions: any = {
        startY: y, // Empezar la tabla después del contenido anterior
        theme: 'grid', // 'striped', 'grid', 'plain', 'css'
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }, // Estilo de la cabecera
        margin: { top: margin, right: margin, bottom: margin, left: margin }, // Márgenes de la tabla (se suman a los del doc)
        columnStyles: {
            // Puedes definir anchos de columna o alineaciones aquí
            // 0: { cellWidth: 'auto' }, // Producto
            // 1: { cellWidth: 60, halign: 'right' }, // Cantidad
            // 2: { cellWidth: 80, halign: 'right' }, // P. Unitario
            // 3: { cellWidth: 80, halign: 'right' }, // Total
             cantidad: { halign: 'right' },
             precioUnitario: { halign: 'right' },
             total: { halign: 'right' },
        },
        bodyStyles: {
             halign: 'left' // Alineación por defecto del cuerpo
        },
        didDrawPage: (data: any) => {
            // Opcional: Añadir pie de página en cada página si la tabla es larga
            doc.setFontSize(8);
            doc.text('Página ' + data.pageNumber, margin, doc.internal.pageSize.getHeight() - margin / 2);
        }
    };

    // Añadir la tabla al documento
    (doc as any).autoTable(tableColumns, tableRows, autoTableOptions);

    // Actualizar la posición 'y' después de la tabla (si necesitas añadir algo debajo)
    // autoTableOptions.startY + (alto de la tabla)
    // Puedes obtener la posición final de la tabla si necesitas añadir contenido justo debajo
    const finalY = (doc as any).autoTable.previous.finalY || y; // Usa la posición final de la tabla, si está disponible


    // --- Resumen y Totales (Debajo de la tabla) ---
     doc.setFontSize(10);
    // Añadir totales a la derecha
    doc.text(`Subtotal: $${sale.price_subtotal?.toFixed(2).replace(/\.00$/, '') || '0'}`, doc.internal.pageSize.getWidth() - margin, finalY + lineHeight * 2, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`TOTAL: $${sale.price_final?.toFixed(2).replace(/\.00$/, '') || '0'}`, doc.internal.pageSize.getWidth() - margin, finalY + lineHeight * 3.5, { align: 'right' });


    // --- Guardar o abrir el PDF ---
    doc.save(`${documentType}_venta_${sale.id}.pdf`); // Descargar el archivo
    // doc.output('dataurlnewwindow'); // Abrir en una nueva ventana (útil para previsualizar)
};