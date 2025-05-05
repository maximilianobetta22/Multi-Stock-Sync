import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  message,
  Typography,
  Space,
  Card,
} from "antd";
import { UploadOutlined, SendOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

const CargaMasiva: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setProductos(jsonData);
      message.success("Archivo cargado correctamente");
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleEnviar = async () => {
    if (productos.length === 0) {
      message.warning("Primero debes subir un archivo Excel.");
      return;
    }

    setLoading(true);
    try {
      const client_id = "TU_CLIENT_ID"; // Reemplaza con tu lógica
      const response = await axios.post(
        `https://TU_BACKEND_URL/api/mercadolibre/carga-masiva/${client_id}`,
        { productos }
      );
      message.success("Productos enviados correctamente a MercadoLibre.");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      message.error("Ocurrió un error al enviar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const columnas = Object.keys(productos[0] || {}).map((key) => ({
    title: <Text strong>{key}</Text>,
    dataIndex: key,
    key,
  }));

  return (
    <div style={{ padding: 32 }}>
      <Card variant="outlined" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3}>Carga masiva de productos</Title>
          <Paragraph>
            Sube un archivo <Text code>.xlsx</Text> con el formato indicado para publicar varios productos a MercadoLibre de forma automática.
          </Paragraph>

          <Upload
            beforeUpload={handleUpload}
            accept=".xlsx"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Seleccionar archivo Excel</Button>
          </Upload>

          {productos.length > 0 && (
            <>
              <Table
                dataSource={productos}
                columns={columnas}
                rowKey={(_, index) => index?.toString() ?? ""}
                scroll={{ x: "max-content" }}
                pagination={{ pageSize: 5 }}
                bordered
              />

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleEnviar}
                loading={loading}
              >
                Enviar productos a MercadoLibre
              </Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CargaMasiva;
