import { Button, Descriptions, Divider, List, Modal, Tag, Typography } from "antd";
import React from "react";

export const detalleVenta = ({
    detalleVisible,
    ventaSeleccionada,
    cerrarDetalle,
}) => {
  return (
    <Modal
        title={`Detalle de Venta #${ventaSeleccionada?.id || ''}`}
        open={detalleVisible}
        onCancel={cerrarDetalle}
        footer={[
          <Button key="close" onClick={cerrarDetalle}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {ventaSeleccionada && (
          <>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="Fecha">
                {new Date(ventaSeleccionada.fecha).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente">
                {ventaSeleccionada.cliente.tipo_cliente_id === 2
                  ? `${ventaSeleccionada.cliente.nombres} ${ventaSeleccionada.cliente.apellidos}`
                  : ventaSeleccionada.cliente.razon_social}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag 
                  color={
                    ventaSeleccionada.estado === 'pagada' ? 'success' :
                    ventaSeleccionada.estado === 'pendiente' ? 'warning' :
                    ventaSeleccionada.estado === 'anulada' ? 'error' : 'processing'
                  }
                >
                  {ventaSeleccionada.estado.charAt(0).toUpperCase() + ventaSeleccionada.estado.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={3}>
                <Typography.Text strong>
                  ${ventaSeleccionada.total.toLocaleString('es-CL')}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={ventaSeleccionada.productos || []}
              renderItem={(item) => (
                <List.Item
                  extra={<Typography.Text strong>${item.subtotal.toLocaleString('es-CL')}</Typography.Text>}
                >
                  <List.Item.Meta
                    title={item.nombre}
                    description={`${item.cantidad} x ${item.precio_unitario.toLocaleString('es-CL')}`}
                  />
                </List.Item>
              )}
              footer={
                <div style={{ textAlign: 'right' }}>
                  <Typography.Title level={5}>
                    Total: ${ventaSeleccionada.total.toLocaleString('es-CL')}
                  </Typography.Title>
                </div>
              }
            />
          </>
        )}
      </Modal>
  );
};