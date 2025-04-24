import React from "react";
import { Card, List, Avatar, Typography } from "antd";

const { Text } = Typography;

export interface ProductoIngreso {
  title: string;
  total_amount: number;
  thumbnail: string;
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
                item.thumbnail ? (
                  <Avatar src={item.thumbnail} shape="square" size="large" />
                ) : (
                  <Avatar style={{ backgroundColor: "#8d92ed" }}>
                    {item.title.slice(0, 2).toUpperCase()}
                  </Avatar>
                )
              }
              title={<Text strong>{item.title}</Text>}
              description={<Text type="secondary">Ingreso: {formatCLP(item.total_amount)}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default GraficoPorDia;
