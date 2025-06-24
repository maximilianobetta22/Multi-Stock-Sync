import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const generarReporteSemanalExcel = async (params: {
  userData: any;
  chartData: any;
  client_id: string;
}) => {
  const { userData, chartData, client_id } = params;

  if (!userData || !userData.nickname) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ingresos");

  worksheet.columns = [
    { header: 'Producto', key: 'producto', width: 50 },
    { header: 'Ingresos Totales', key: 'ingresos', width: 20 },
    { header: 'Cantidad Vendida', key: 'cantidad', width: 20 },
  ];

  chartData.labels.forEach((label: string, index: number) => {
    worksheet.addRow({
      producto: label,
      ingresos: chartData.datasets[0].data[index],
      cantidad: chartData.datasets[1].data[index],
    });
  });

  const total = chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
  const totalRow = worksheet.addRow({ producto: 'Total$', ingresos: total });
  totalRow.font = { bold: true };

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };

      if (rowNumber === 1) {
        cell.font = { bold: true, color: { argb: '000000' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DDEBF7' },
        };
      } else if (rowNumber === worksheet.rowCount) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' },
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2CC' },
        };
      }

      if (colNumber === 2 && rowNumber > 1) {
        cell.numFmt = '"$"#,##0';
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `IngresosSemana_${client_id}_${userData.nickname}.xlsx`;
  saveAs(new Blob([buffer]), filename);
};
