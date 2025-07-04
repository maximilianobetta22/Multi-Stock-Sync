import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Button, Tabs, Table, Typography } from 'antd';
import { RiseOutlined, FallOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
const { Text } = Typography;

interface Props {
  mode: 'month' | 'year';
  result: any;
  months: { [key: string]: string };
  formatCurrency: (val: string | number | undefined) => string;
}

interface SoldProduct {
  title: string;
  quantity: number;
  price: number;
}

const productColumns = (formatCurrency: (val: number) => string) => [
  {
    title: 'Producto',
    dataIndex: 'title',
    key: 'title',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: 'Cantidad Vendida',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center' as const,
  },
  {
    title: 'Ingresos Totales',
    dataIndex: 'price',
    key: 'price',
    align: 'right' as const,
    render: (price: number) => formatCurrency(price),
  },
];

const ComparisonTable: React.FC<Props> = ({ mode, result, months, formatCurrency }) => {
  const data1 = mode === 'month' ? result.data?.month1 : result.data?.year1;
  const data2 = mode === 'month' ? result.data?.month2 : result.data?.year2;

  const label1 = mode === 'month' ? `${months[data1?.month] || '-'} ${data1?.year || ''}` : data1?.year || '-';
  const label2 = mode === 'month' ? `${months[data2?.month] || '-'} ${data2?.year || ''}` : data2?.year || '-';

  const total1 = data1?.total_sales || 0;
  const total2 = data2?.total_sales || 0;

  const period1Date = new Date(data1.year, mode === 'year' ? 0 : data1.month - 1);
  const period2Date = new Date(data2.year, mode === 'year' ? 0 : data2.month - 1);
  
  const isPeriod2Recent = period2Date > period1Date;

  const recentTotal = isPeriod2Recent ? total2 : total1;
  const previousTotal = isPeriod2Recent ? total1 : total2;

  const difference = recentTotal - previousTotal;
  const percentageChange = previousTotal === 0 
    ? (recentTotal > 0 ? 100 : 0) 
    : (difference / previousTotal) * 100;

  const [verDetalle, setVerDetalle] = useState(false);

  const tabItems = [
    {
      label: `Detalle de ${label1}`,
      key: '1',
      children: (
        <Table
          columns={productColumns(formatCurrency)}
          dataSource={data1?.sold_products || []}
          rowKey={(record: SoldProduct, index) => `p1-${record.title}-${index}`}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      ),
    },
    {
      label: `Detalle de ${label2}`,
      key: '2',
      children: (
        <Table
          columns={productColumns(formatCurrency)}
          dataSource={data2?.sold_products || []}
          rowKey={(record: SoldProduct, index) => `p2-${record.title}-${index}`}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={`Ventas en ${label1}`} value={total1} formatter={formatCurrency} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title={`Ventas en ${label2}`} value={total2} formatter={formatCurrency} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Diferencia (Reciente vs. Anterior)"
              value={difference}
              formatter={formatCurrency}
              valueStyle={{ color: difference >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={difference >= 0 ? <RiseOutlined /> : <FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
             <Statistic
              title="Cambio Porcentual"
              value={percentageChange}
              precision={2}
              valueStyle={{ color: percentageChange >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={percentageChange >= 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Button
        type="link"
        icon={verDetalle ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        onClick={() => setVerDetalle(!verDetalle)}
        style={{ marginTop: '24px' }}
      >
        {verDetalle ? 'Ocultar Detalle de Productos' : 'Ver Detalle de Productos'}
      </Button>

      {verDetalle && (
        <Card style={{ marginTop: '16px' }}>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
      )}
    </div>
  );
};

export default ComparisonTable;
//este componente se encarga de mostrar una tabla de comparación entre dos períodos de ventas, ya sea por mes o por año. 
// Se encarga de calcular y mostrar las diferencias y porcentajes de cambio entre los totales de ventas de ambos períodos, así como un detalle opcional de los productos vendidos en cada período.  