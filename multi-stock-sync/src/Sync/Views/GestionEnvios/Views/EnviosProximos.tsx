// src/components/EnviosProximos.tsx
import React from 'react';
import { Table, Alert, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEnviosProximos } from '../Hooks/useEnviosProximos';
import {  Envio } from '../Types/EnviosProximos.Type';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';

/**
 * Definición de las columnas para la tabla de envíos próximos
 */


const columns: ColumnsType<Envio> = [
  { title: "Id orden", dataIndex: "order_id", key: "order_id" },
  { title: "Id de envio", dataIndex: "shipping_id", key: "shipping_id" },
  { title: "Fecha de envio limite", dataIndex: "fecha_envio_programada", key: "fecha_envio_programada" ,
    render: (dateL: string) => {
      const displayText =dateL.split(" ")[0];
      const [año,mes,dia]= displayText.split("-")
      const displayTextFormat = `${dia}/${mes}/${año}`
      return <span>{displayTextFormat}</span>
    }
  },
  {title: "Id de producto",dataIndex:"id_producto",key:"product_id"},
  {title: "Titulo", dataIndex:"nombre_producto",key:"title"},
  {title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
  { title: "SKU", dataIndex: "sku", key: "sku" },
  { title: "Tamaño", dataIndex: "tamaño", key: "size",
    render: (size: string)=>{
      const displayText =size === ""?"no aplica": size;
      
      return (<span >{displayText}</span>) 
    
    }
  },
  {
    title: "Estado",
    dataIndex: "shipment_status",
    key: "estado",
    render: (status: string) => {
      const displayText =status === null?"no Enviado": status;
      const tagColor = "brown"
      return tagColor ? (
        <Tag color={tagColor}>{displayText}</Tag>
      ) : (
        <span>{displayText}</span>
      );
    }
  },
];

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
 * Componente que muestra los envíos próximos en una tabla
 * Gestiona estados de carga, error y datos vacíos
*/
const EnviosProximos: React.FC = () => {
  // Utilizamos el hook personalizado para obtener los datos y estado
  const { data, loading, error, clearError } = useEnviosProximos();

  // Muestra un spinner durante la carga
  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

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
          emptyText: error ? 'No se pudieron cargar los datos' : 'No hay envíos próximos'
        }}
      />
      
      {/* Botón para actualizar los datos *
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
};

export default EnviosProximos;