import { useEffect } from "react";
import { notification } from "antd";

export const StockNotification = () => {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 3 },
  });
  //variable para tomar la conexion seleccionada
  const connection = JSON.parse(
    localStorage.getItem("conexionSeleccionada") || "{}"
  );

  useEffect(() => {
    api.open({
      message: "Notificación de Stock",
      description: "Producto con stock bajo",
      type: "warning",
      placement: "topRight",
    });
  }, []);
  return <>{contextHolder}</>;
};
