import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import EnviosDia from "./Views/EnviosDia";
import EnviosProximos from "./Views/EnviosProximos";
import EnviosTransito from "./Views/EnviosTransito";
import EnviosFinalizados from "./Views/EnviosFinalizados";
import EnviosCancelados from "./Views/EnviosCancelados";

// Si tienes un componente separado para cambio de estado, descomenta esto:
// import CambioEstadoEnvios from "./Views/CambioEstadoEnvios";

const GestionEnvios: React.FC = () => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Envíos del Día",
      children: <EnviosDia />,
    },
    {
      key: "2",
      label: "Próximos Envíos",
      children: <EnviosProximos />,
    },
    {
      key: "3",
      label: "En Tránsito",
      children: <EnviosTransito />,
    },
    {
      key: "4",
      label: "Finalizados",
      children: <EnviosFinalizados />,
    },
    {
      key: "5",
      label: "Envios Cancelados",
      children: <EnviosCancelados />,
    },
  ];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Gestión de Envíos</h2>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default GestionEnvios;
