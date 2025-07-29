import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  message,
  Typography,
  Space,
  Card,
  Tag,
} from "antd";
import { UploadOutlined, SendOutlined, CheckCircleOutlined, PaperClipOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

const CargaMasiva: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [productosProcesados, setProductosProcesados] = useState<any[]>([]);

  const handleUpload = (selectedFile: File) => {
    const isXlsx = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      message.error('Solo puedes subir archivos .xlsx!');
      return Upload.LIST_IGNORE;
    }
    
    setFile(selectedFile);
    setProductosProcesados([]);
    message.success(`${selectedFile.name} seleccionado correctamente.`);

    return false;
  };

  const handleEnviar = async () => {
    if (!file) {
      message.warning("Primero debes seleccionar un archivo Excel.");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Obtenemos el token de autenticación.
      const token = localStorage.getItem('token');
      if (!token) {
        message.error("Error de autenticación. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
      
      const apiUrl = `${process.env.VITE_API_URL}/mercadolibre/carga-masiva/leer-excel`;

      const response = await axios.post(
        apiUrl,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      message.success("Archivo procesado correctamente por el servidor.");
      
      const productosArray = Object.values(response.data.data || {});
      setProductosProcesados(productosArray);

      console.log("Respuesta del servidor:", response.data);

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Ocurrió un error al procesar el archivo.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const columnas = Object.keys(productosProcesados[0] || {}).map((key) => ({
    title: <Text strong>{key}</Text>,
    dataIndex: key,
    key,
    render: (text: any) => String(text ?? '') // Asegura que se renderice como string
  }));

  return (
    <div style={{ padding: 32 }}>
      <Card variant="outlined" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3}>Carga masiva de productos</Title>
          <Paragraph>
            Sube un archivo <Text code>.xlsx</Text>
          </Paragraph>

          <Space>
            <Upload
              beforeUpload={handleUpload}
              accept=".xlsx"
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
            </Upload>

            {file && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleEnviar}
                loading={loading}
              >
                Procesar archivo en el servidor
              </Button>
            )}
          </Space>

          {file && !loading && (
             <Tag icon={<PaperClipOutlined />} color="blue">
               Archivo seleccionado: {file.name}
             </Tag>
          )}

          {productosProcesados.length > 0 && (
            <>
              <Title level={4}>Resultados del procesamiento</Title>
              <Paragraph>
                <CheckCircleOutlined style={{ color: 'green', marginRight: 8 }} />
                Se encontraron y procesaron <Text strong>{productosProcesados.length}</Text> productos.
              </Paragraph>
              <Table
                dataSource={productosProcesados}
                columns={columnas}
                rowKey={(_, index) => index?.toString() ?? ""}
                scroll={{ x: "max-content" }}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CargaMasiva;
