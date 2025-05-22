import { useState } from 'react';
import { Alert, Collapse, Table, Button, Input, message, Space, Typography } from 'antd';
import { DownloadOutlined, MailOutlined, WarningOutlined } from '@ant-design/icons';
import { useStockCritic } from '../Sync/Hooks/useStockCritic';

const { Panel } = Collapse;
const { Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getClientIdFromConexionSeleccionada(): string | undefined {
  try {
    const raw = localStorage.getItem('conexionSeleccionada');
    if (!raw) return undefined;
    const obj = JSON.parse(raw);
    return obj.client_id;
  } catch {
    return undefined;
  }
}

export default function StockCriticAlert() {
  const clientIdStr = getClientIdFromConexionSeleccionada();
  const clientId = clientIdStr ? Number(clientIdStr) : undefined;
  const { data, loading, error } = useStockCritic(clientId);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Mostrar error solo una vez
  if (error) {
    message.destroy();
    message.error(error);
    return (
      <Alert
        message="Acceso no autorizado"
        description="Por favor, inicia sesión nuevamente para ver el stock crítico."
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (!clientId) return null;

  if (loading) {
    return (
      <Alert
        message="Cargando alerta de stock crítico..."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (!data || data.length === 0) return null;

  const token = localStorage.getItem('token');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/mercadolibre/stock-critic/${clientId}?excel=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        message.error(error.message || 'No se pudo descargar el archivo');
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-critico-${clientId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('Archivo descargado correctamente');
    } catch (e) {
      message.error('Error de red al descargar el archivo');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      message.warning('Ingrese un email válido.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/mercadolibre/stock-critic/${clientId}?mail=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        message.success('Email enviado correctamente.');
        setEmail('');
      } else {
        const error = await res.json();
        message.error(error.message || 'Error al enviar el email.');
      }
    } catch {
      message.error('Error de red.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Collapse style={{ marginBottom: 16 }} bordered={false} defaultActiveKey={['1']}>
      <Panel
        header={
          <Alert
            message={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <Text strong>¡Atención! Stock crítico detectado en MercadoLibre</Text>
                <Text type="danger">(Productos críticos: {data.length})</Text>
              </Space>
            }
            type="warning"
            showIcon
            style={{ background: '#fffbe6', border: 'none', width: '100%' }}
          />
        }
        key="1"
        showArrow={false}
      >
        <div style={{ margin: '16px 0' }}>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              size="small"
              loading={downloading}
            >
              Descargar Excel
            </Button>
            <Input
              placeholder="Enviar reporte a email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: 220 }}
              size="small"
              allowClear
              disabled={sending}
              onPressEnter={handleSendEmail}
            />
            <Button
              type="default"
              icon={<MailOutlined />}
              loading={sending}
              onClick={handleSendEmail}
              size="small"
              disabled={sending}
            >
              Enviar
            </Button>
          </Space>
        </div>
        <Table
          dataSource={data}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={{ pageSize: 8 }}
          bordered
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              width: 120,
            },
            {
              title: 'Nombre',
              dataIndex: 'title',
              width: 300,
              render: (text: string, record: any) => (
                <a href={record.permalink} target="_blank" rel="noopener noreferrer">{text}</a>
              ),
            },
            {
              title: 'Stock',
              dataIndex: 'available_quantity',
              align: 'center',
              render: (stock: number) => (
                <span style={{ color: stock <= 0 ? '#cf1322' : '#faad14', fontWeight: 600 }}>
                  {stock}
                </span>
              ),
              width: 100,
            },
            {
              title: 'Precio',
              dataIndex: 'price',
              render: (price: number) => `$${price.toLocaleString()}`,
              width: 120,
            },
          ]}
        />
      </Panel>
    </Collapse>
  );
}