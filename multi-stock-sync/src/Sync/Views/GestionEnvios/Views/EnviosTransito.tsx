import React, {useState} from "react";
import { Table, Spin, Alert,Button, Tag, Descriptions, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Enviostransito } from "../Types/EnviosProximos.Type";
import { useEnviosTransito } from "../Hooks/useEnviosTransito";




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

/**
 * Componente que muestra los envíos en transito en una tabla
 * Gestiona estados de carga, error y datos vacíos
*/
const EnviosProximos: React.FC = () => {
  
  // Utilizamos el hook personalizado para obtener los datos y estado
  const { data, loading, error, refetch, clearError } = useEnviosTransito();
  
  
  /*const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<Enviostransito | null>(null);
  const showModal = (envio: Enviostransito) => {
    setSelectedEnvio(envio);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };*/
  // Muestra un spinner durante la carga
  if (loading) {
    return <Spin tip="Cargando envíos en transito..." size="large" />;
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
      
      {/* Botón para actualizar los datos 
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button 
          type="primary" 
          onClick={refetch}
          loading={loading}
        >
          Recargar Datos
        </Button>
      </div>*/}
    </div>
  );
  /*<Modal
  title="Detalles del Envío"
  open={isModalOpen}
  onCancel={handleCancel}
  footer={[
    <Button key="back" onClick={handleCancel}>
      Cerrar
    </Button>
  ]}
  width={700}
>
  {selectedEnvio && (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="ID de Envío">{selectedEnvio.shipping_id}</Descriptions.Item>
      <Descriptions.Item label="Producto">{selectedEnvio.title}</Descriptions.Item>
      <Descriptions.Item label="ID de Producto">{selectedEnvio.productId}</Descriptions.Item>
      <Descriptions.Item label="Cantidad">{selectedEnvio.quantity}</Descriptions.Item>
      <Descriptions.Item label="Tamaño">{selectedEnvio.size}</Descriptions.Item>
      <Descriptions.Item label="Estado">
        {selectedEnvio.substatus === "out_for_delivery" ? 
          <Tag color="blue">Enviado</Tag> : 
          selectedEnvio.substatus === "delivered" ? 
          <Tag color="green">Entregado</Tag> : 
          <Tag color="orange">Por enviar hoy</Tag>
        }
      </Descriptions.Item>
      <Descriptions.Item label="Fecha estimada de entrega">
        {selectedEnvio.estimated_delivery_date || "No disponible"}
      </Descriptions.Item>
      <Descriptions.Item label="Número de seguimiento">
        {selectedEnvio.tracking_number || "No disponible"}
      </Descriptions.Item>
      <Descriptions.Item label="Información del receptor">
        <Space direction="vertical">
          <div><strong>Nombre:</strong> {selectedEnvio.receptor?.name || "No disponible"}</div>
          <div><strong>Dirección:</strong> {selectedEnvio.receptor?.dirrection || "No disponible"}</div>
          <div><strong>Teléfono:</strong> {selectedEnvio.receptor?.phone || "No disponible"}</div>
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="Notas adicionales">
        {selectedEnvio.additional_notes || "Sin notas adicionales"}
      </Descriptions.Item>
    </Descriptions>
  )}
</Modal>*/
};

export default EnviosProximos;