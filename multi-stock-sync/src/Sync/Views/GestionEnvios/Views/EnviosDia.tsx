import React from "react";
import { Table, Spin, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";


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
  
}


import useFetchShipmentsByClient from "../Hooks/useFetchShipmentsByClient";

const EnviosDia: React.FC = () => {
  
  const { data: allShipments, loading, error } = useFetchShipmentsByClient();

  
  const today = dayjs(); 
  const todayYear = today.year();
  const todayMonth = today.month(); 
  const todayDay = today.date();   


  const enviosHoy = allShipments.filter((item: Envio) => {
      const shipmentDateString = item.shipment_history?.date_created;

      if (!shipmentDateString) {
          return false; 
      }

      const shipmentDate = dayjs(shipmentDateString);

 
      if (!shipmentDate.isValid()) {

          return false; 
      }

     
      return shipmentDate.year() === todayYear &&
             shipmentDate.month() === todayMonth &&
             shipmentDate.date() === todayDay;
  });



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
     
        render: (date: string | undefined) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'N/A',
    },
  ];

  return loading ? (
  
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Spin tip="Cargando envíos del día..." size="large" />
    </div>
  ) : error ? (
  
    <div style={{ marginTop: '20px' }}>
      <Alert type="error" message={`Error al cargar envíos: ${error}`} />
    </div>
  ) : (
    
    <div>
      {/* Título de la sección con la fecha de hoy formateada */}
      <h2>Envíos del Día ({dayjs().format('YYYY-MM-DD')})</h2>
      {enviosHoy.length === 0 ? (
       
        <Alert type="info" message="No hay envíos programados para hoy." />
      ) : (
        
        <Table
          rowKey="id" 
          columns={columns}
          dataSource={enviosHoy} 
          pagination={{ pageSize: 10 }} 
        />
      )}
    </div>
  );
};

export default EnviosDia;