import React from "react";
import { Card, List, Avatar, Typography } from "antd";

const { Text } = Typography;

// Tipo de producto esperado
export interface ProductoIngreso {
  title: string;
  total_amount: number;
  thumbnail: string;
}

// Props esperadas en el componente
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
                  // Si el producto tiene imagen, mostrarla
                  <Avatar src={item.thumbnail} shape="square" size="large" />
                ) : (
                  // Si no tiene imagen, usar las iniciales
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
// este componente es un gráfico que muestra los 10 productos con mayor ingreso del día. Se utiliza Ant Design para el diseño y la funcionalidad. El componente recibe como props los datos de los productos y una función para formatear el valor en CLP (pesos chilenos). Se utiliza un List de Ant Design para mostrar los productos, con su imagen (o iniciales) y el ingreso correspondiente. El componente es responsivo y se adapta a diferentes tamaños de pantalla.
// Se utiliza un Card de Ant Design para envolver el List y darle un estilo atractivo. El componente es fácil de usar y se puede integrar en otras partes de la aplicación donde se necesite mostrar los productos con mayor ingreso del día.