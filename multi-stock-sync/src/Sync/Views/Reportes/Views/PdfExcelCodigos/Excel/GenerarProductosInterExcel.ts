import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  date_created: string;
}

export const generarexcelProductosInter = async (data: ProductoML[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productos");

  sheet.columns = [
    { header: "ID", key: "id", width: 15 },
    { header: "Nombre", key: "title", width: 40 },
    { header: "Precio", key: "price", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Estado", key: "status", width: 15 },
    { header: "Fecha de creación", key: "fecha", width: 25 },
  ];

  data.forEach((p) => {
    sheet.addRow({
      id: p.id,
      title: p.title,
      price: p.price,
      stock: p.available_quantity,
      status: p.status,
      fecha: new Date(p.date_created).toLocaleDateString(),
    });
  });

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell,) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      if (rowNumber === 1) {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDEBF7" } };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "ProductosInternacionales.xlsx");
};
