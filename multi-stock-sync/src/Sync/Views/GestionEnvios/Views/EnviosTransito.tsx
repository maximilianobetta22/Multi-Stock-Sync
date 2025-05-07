import React from "react";
import { Table, Alert,Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Enviostransito } from "../Types/EnviosProximos.Type";
import { useEnviosTransito } from "../Hooks/useEnviosTransito";
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico";




/**
 * Convierte la severidad del error a un tipo de alerta de Antd
 */
const getAlertType = (severity: string) => {
  switch(severity) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    default: return 'info';
  }
};


const EnviosProximos: React.FC = () => {
  
  // Utilizamos el hook personalizado para obtener los datos y estado
  const { data, loading, error, clearError } = useEnviosTransito();
  

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }
  const columns: ColumnsType<Enviostransito> = [
    { title: "Id envio", dataIndex: "shipping_id", key: "id" },
    { title: "Id producto", dataIndex: "productId", key: "id" },
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
   
    { title: "Tamaño", dataIndex: "size", key: "size" },
 
   {
      title: "Dirección",
      dataIndex: ["receptor","dirrection"],
      key: "direccion",
    },{
      title: "N° Seguimiento",
      dataIndex: "tracking_number",
      key: "tracking_number",
    },
    { 
      title: "Estado", 
      dataIndex: "substatus", 
      key: "status",
      render: (substatus: string) => {
        // Convertir "out of delivery" a "Enviado"
        const displayText = substatus === "out_for_delivery" ? "Enviado" : "Por enviar hoy";
        
        // Opcional: agregar colores según el estado
        let tagColor = '';
        if (substatus === "out_for_delivery") tagColor = 'blue';
        if (substatus === null || substatus === "soon_deliver") tagColor = 'red';
        
        return tagColor ? (
          <Tag color={tagColor}>{displayText}</Tag>
        ) : (
          <span>{displayText}</span>
        );
      }
    },
    
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Muestra alerta de error si existe */}
      {error && (
        <Alert
          message={error.message}
          type={getAlertType(error.severity)}
          showIcon
          closable
          onClose={clearError}
          action={
            // Para errores de servidor, ofrece botón de recarga de página
            error.type === 'server' && (
              <Button size="small" type="primary" onClick={() => window.location.reload()}>
                Recargar
              </Button>
            )
          }
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Tabla de envíos próximos */}
      <Table 
        rowKey="id" 
        columns={columns} 
        dataSource={data} 
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: error ? 'No se pudieron cargar los datos' : 'No hay envíos en transito'
        }}
      />
      
     
    </div>
  );
  
};

export default EnviosProximos;