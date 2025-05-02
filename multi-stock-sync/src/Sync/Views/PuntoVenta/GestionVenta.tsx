import React, { useMemo } from "react";
import { Tabs, Typography, Card } from "antd";
import type { TabsProps } from "antd";
import NuevaVenta from "./Views/NuevaVenta";
import HistorialVentas from "./Views/HistorialVentas";
import BorradoresVenta from "./Views/BorradoresVenta";

const { Title } = Typography;

const GestionVenta: React.FC = () => {

  const selectedCompanyId = useMemo(() => {
    try {
      const conexionData = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
      const id = conexionData?.client_id;
      return (typeof id === 'number' || typeof id === 'string') && String(id).length > 0 ? id : null;
    } catch (e) {
      console.error("Error al parsear conexionSeleccionada de localStorage", e);
      return null;
    }
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "nueva-venta",
      label: "Nueva Venta",
      children: <NuevaVenta companyId={selectedCompanyId} />,
    },
    {
      key: "historial-ventas",
      label: "Historial de Ventas",
      children: <HistorialVentas /* companyId={selectedCompanyId} */ />,
    },
    {
      key: "borradores",
      label: "Borradores",
      children: <BorradoresVenta /* companyId={selectedCompanyId} */ />,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ marginBottom: "20px" }}>Punto de Venta</Title>
      <Card>
        <Tabs
          defaultActiveKey="nueva-venta"
          items={items}
          size="large"
        />
      </Card>
    </div>
  );
};

export default GestionVenta;