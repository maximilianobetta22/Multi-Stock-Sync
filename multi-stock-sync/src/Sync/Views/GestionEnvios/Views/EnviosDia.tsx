import React from "react";
import { Table, Spin, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";



// Interfaz para los datos del envío, debe coincidir con la del hook y la API
interface Envio {
  id: string;
  title: string;
  quantity: number;
  size: string;
  sku: string;
  shipment_history: {
    status: string;
    date_created?: string;
  };
  // Asegúrate de que esta interfaz coincida con la del hook y la respuesta de tu API
}

// Asegúrate de que la ruta de importación de tu hook sea correcta
import useFetchShipmentsByClient from "../Hooks/useFetchShipmentsByClient";

const EnviosDia: React.FC = () => {
  // Usar el hook personalizado para obtener los datos, estado de carga y error
  const { data: allShipments, loading, error } = useFetchShipmentsByClient();

  // Lógica para filtrar los envíos para mostrar solo los de hoy
  const today = dayjs(); // Obtener la fecha actual
  const todayYear = today.year();
  const todayMonth = today.month(); // month() es base 0 (0 para Enero)
  const todayDay = today.date();   // date() es el día del mes (1-31)


  const enviosHoy = allShipments.filter((item: Envio) => {
      const shipmentDateString = item.shipment_history?.date_created;

      if (!shipmentDateString) {
          return false; // Si no hay fecha, no es para hoy
      }

      const shipmentDate = dayjs(shipmentDateString);

      // Verificar si la fecha parseada es válida
      if (!shipmentDate.isValid()) {
          // Puedes descomentar esto para ver advertencias si hay fechas inválidas en tus datos
          // console.warn(`Fecha de envío inválida encontrada (filtro EnviosDia): ${shipmentDateString}`);
          return false; // Si la fecha no es válida, no la incluimos
      }

      // Comparando manualmente año, mes y día (sin necesidad de plugin isSame)
      return shipmentDate.year() === todayYear &&
             shipmentDate.month() === todayMonth &&
             shipmentDate.date() === todayDay;
  });


  // Definir las columnas para la tabla de Ant Design
  const columns: ColumnsType<Envio> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Tamaño", dataIndex: "size", key: "size" },
    {
      title: "Estado",
      dataIndex: ["shipment_history", "status"],
      key: "estado",
    },
    {
        title: "Fecha Programada",
        dataIndex: ["shipment_history", "date_created"],
        key: "fechaProgramada",
        // Formatear la fecha para mostrarla de forma legible
        render: (date: string | undefined) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'N/A',
    },
  ];

  return loading ? (
    // Mostrar indicador de carga centralizado mientras el hook está cargando
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Spin tip="Cargando envíos del día..." size="large" />
    </div>
  ) : error ? (
    // Mostrar mensaje de error si el hook reporta un error (ej. no hay cliente, error de red)
    <div style={{ marginTop: '20px' }}>
      <Alert type="error" message={`Error al cargar envíos: ${error}`} />
    </div>
  ) : (
    // Mostrar la tabla si no hay carga ni error
    <div>
      {/* Título de la sección con la fecha de hoy formateada */}
      <h2>Envíos del Día ({dayjs().format('YYYY-MM-DD')})</h2>
      {enviosHoy.length === 0 ? (
        // Mostrar mensaje si no hay envíos para hoy después de filtrar
        <Alert type="info" message="No hay envíos programados para hoy." />
      ) : (
        // Renderizar la tabla con los datos filtrados (solo envíos de hoy)
        <Table
          rowKey="id" // Usar 'id' como clave única para cada fila
          columns={columns}
          dataSource={enviosHoy} // Usar los datos filtrados aquí
          pagination={{ pageSize: 10 }} // Mantener la paginación
        />
      )}
    </div>
  );
};

export default EnviosDia;