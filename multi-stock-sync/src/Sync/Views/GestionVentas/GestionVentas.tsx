import React from "react"
import { Tabs, TabsProps } from "antd";
import ListaClientes from "./Views/ListaClientes"
import { HistorialVentas } from "./Views/historialVentas";

const GestionVentas: React.FC = () => {
    const items: TabsProps["items"] = [
      {
        key: "1",
        label: "Venta",
        children: <></>,
      },{
        key: "2",
        label: "Clientes",
        children: <ListaClientes/>
      },{
        key: "3",
        label: "Historial ventas",
        children: <HistorialVentas/>
      },
      
      
    ];
  
    return (
      <div style={{ padding: "1rem" }}>
        <h2 className="text-2xl font-semibold mb-4">Gestión de Ventas</h2>
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    );
  };
  
  export default GestionVentas;