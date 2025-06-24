import type React from "react";
import { Tabs, Card, Typography } from "antd";
import type { TabsProps } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import EnviosDia from "./Views/EnviosDia";
import EnviosProximos from "./Views/EnviosProximos";
import EnviosTransito from "./Views/EnviosTransito";
import EnviosFinalizados from "./Views/EnviosFinalizados";
import EnviosCancelados from "./Views/EnviosCancelados";

const { Title } = Typography

const GestionEnvios: React.FC = () => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <CalendarOutlined />
          Envíos del Día
        </span>
      ),
      children: <EnviosDia />,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Próximos Envíos
        </span>
      ),
      children: <EnviosProximos />,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <CarOutlined />
          En Tránsito
        </span>
      ),
      children: <EnviosTransito />,
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Finalizados
        </span>
      ),
      children: <EnviosFinalizados />,
    },
    {
      key: "5",
      label: (
        <span className="flex items-center gap-2">
          <CloseCircleOutlined />
          Cancelados
        </span>
      ),
      children: <EnviosCancelados />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="shadow-lg">
        <div className="mb-6">
          <Title level={2} className="text-gray-800 mb-2">
           Gestión de Envíos
          </Title>
          <p className="text-gray-600">Administra y monitorea todos tus envíos desde un solo lugar</p>
        </div>

        <Tabs
          defaultActiveKey="1"
          items={items}
          size="large"
          className="custom-tabs"
          tabBarStyle={{
            marginBottom: "24px",
            borderBottom: "4px solid #f0f0f0",
          }}
        />
      </Card>
    </div>
  )
}

export default GestionEnvios;