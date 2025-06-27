// src/utils/excelGenerators.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DispatchData } from '../PDF/GenerarHistorialDespachoPdf';

export const generarHistorialDespachoExcel = async (params: {
  data: DispatchData[];
  sku: string;
  client_id: string;
}) => {
  const { data, sku,} = params;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Historial');

  // Defino columnas
  sheet.columns = [
    { header: 'Estado', key: 'status', width: 20 },
    { header: 'Fecha', key: 'date', width: 25 },
    { header: 'Cant.', key: 'cantidad', width: 12 },
    { header: 'ID Cliente', key: 'cliente', width: 15 },
  ];

  // Agrego filas
  data.forEach((d) => {
    sheet.addRow({
      status: d.status,
      date: d.date_shipped,
      cantidad: d.total_items,
      cliente: d.customer_id,
    });
  });

  // Estilos: bordes, header fill, formato numérico
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      // Bordes finos en todas las celdas
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };

      if (rowNumber === 1) {
        // Header: negrita + fondo azul claro
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DDEBF7' },
        };
      } else {
        // Filas de datos: alterno color
        const color = rowNumber % 2 === 0 ? 'FFF2CC' : 'FFFFFF';
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color },
        };
      }

      // Formato numérico para la columna 'Cant.'
      if (colNumber === 3 && rowNumber > 1) {
        cell.numFmt = '0';
      }
    });
  });

  // Guardo el archivo
  const buf = await workbook.xlsx.writeBuffer();
  const filename = `HistorialDespacho_${sku}.xlsx`;
  saveAs(new Blob([buf]), filename);
};