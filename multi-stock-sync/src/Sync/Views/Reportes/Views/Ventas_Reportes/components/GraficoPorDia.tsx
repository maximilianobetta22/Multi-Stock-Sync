import React from "react";
import { Card, List, Avatar, Typography } from "antd";

const { Text } = Typography;

interface ProductoIngreso {
  nombre: string;
  ingreso: number;
  imagen: string;
}

interface Props {
  data: ProductoIngreso[];
  formatCLP: (value: number) => string;
}

const GraficoPorDia: React.FC<Props> = ({ data, formatCLP }) => {
  return (
    <Card title="Top 10 productos por ingresos del día" style={{ marginBottom: 24 }}>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                item.imagen ? (
                  <Avatar src={item.imagen} shape="square" size="large" />
                ) : (
                  <Avatar style={{ backgroundColor: "#8d92ed" }}>
                    {item.nombre.slice(0, 2).toUpperCase()}
                  </Avatar>
                )
              }
              title={<Text strong>{item.nombre}</Text>}
              description={<Text type="secondary">Ingreso: {formatCLP(item.ingreso)}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default GraficoPorDia;
