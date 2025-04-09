import React, { useEffect, useState } from "react";
import styles from "./HomeReportes.module.css";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTags,
  faStar,
  faCalendarWeek,
  faClipboardList,
  faComments,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import {
  faMoneyBillWave,
  faCreditCard as faCreditCardIcon,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { useReceptionManagements } from "../../hooks/useReceptionManagements";

const HomeReportes: React.FC = () => {
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    fetchConnections,
    connections,
    fetchStoreSummary,
    storeSummary,
    loading,
    toastType,
  } = useReceptionManagements(); //hook para manejar la lógica de las conexiones y el resumen de la tienda

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchConnections(); // llamamos a la función para obtener las conexiones al cargar el componente
  }, [fetchConnections]);

  const handleConnectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const clientId = event.target.value;
    setSelectedConnection(clientId);
    if (clientId) fetchStoreSummary(clientId); // llamamos a la función para obtener el resumen de la tienda
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      <div className={`${styles.container} container`}>
        {toastMessage && (
          <ToastComponent
            message={toastMessage}
            type={toastType}
            timeout={2000}
            onClose={() => setToastMessage(null)}
          />
        )}
        {!loading && (
          <>
            <h1 className="text-center my-4">Estadísticas Generales</h1>
            <p className="text-center mt-2 mb-2">
              Selecciona una conexión para ver el resumen de la tienda
            </p>
            <div className="mb-4 d-flex justify-content-center">
              <select
                className="form-control w-50"
                value={selectedConnection}
                onChange={handleConnectionChange}
              >
                <option value="">Selecciona una conexión</option>
                {connections &&
                  connections.map((connection) => (
                    <option
                      key={connection.client_id}
                      value={connection.client_id}
                    >
                      {connection.nickname} ({connection.client_id})
                    </option>
                  ))}
              </select>
            </div>
            {storeSummary && (
              <div className="card shadow-sm p-4 mb-4">
                <h2 className="text-primary">Resumen de la Tienda</h2>
                <p>
                  <strong>Ventas Totales:</strong> $
                  {storeSummary.total_sales.toLocaleString()}
                </p>
                <p>
                  <strong>Ventas Mensuales ({currentMonth}):</strong> $
                  {storeSummary.monthly_sales.toLocaleString()}
                </p>
                <p>
                  <strong>Ventas Anuales ({currentYear}):</strong> $
                  {storeSummary.annual_sales.toLocaleString()}
                </p>
                <h4 className="mt-4">Productos Más Vendidos</h4>
                <ul className="list-group">
                  {storeSummary.top_selling_products.length > 0 ? (
                    storeSummary.top_selling_products.map((product, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>
                          {index + 1}. {product.title} - {product.quantity}{" "}
                          vendidos
                        </span>{" "}
                        <span>${product.total_amount.toLocaleString()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item">
                      No hay productos más vendidos
                    </li>
                  )}
                  {storeSummary.top_selling_products.length > 0 && (
                    <Link
                      to={`/sync/reportes/productos-mas-vendidos/${selectedConnection}`}
                      className="btn btn-primary mt-3"
                    >
                      Ver lista completa
                    </Link>
                  )}
                </ul>
                <h4 className="mt-4">Métodos de Pago Preferidos</h4>
                <ul>
                  <li className={styles.noDecoration}>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                    Dinero en cuenta:{" "}
                    {storeSummary.top_payment_methods.account_money ?? 0}
                  </li>
                  <li className={styles.noDecoration}>
                    <FontAwesomeIcon icon={faUniversity} className="mr-2" />
                    Tarjeta de débito:{" "}
                    {storeSummary.top_payment_methods.debit_card ?? 0}
                  </li>
                  <li className={styles.noDecoration}>
                    <FontAwesomeIcon icon={faCreditCardIcon} className="mr-2" />
                    Tarjeta de crédito:{" "}
                    {storeSummary.top_payment_methods.credit_card ?? 0}
                  </li>
                </ul>
              </div>
            )}
            {selectedConnection && (
              <>
                <h3 className="mt-4">Reportes Disponibles</h3>
                <div className="list-group mb-5">
                  <Link
                    to={`/sync/reportes/ventas/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />{" "}
                    Ventas
                  </Link>
                  <Link
                    to={`/sync/reportes/ingresos-categoria-producto/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faTags} className="mr-2" /> Ingresos
                    por categoría de producto
                  </Link>
                  <Link
                    to={`/sync/reportes/productos-mas-vendidos/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faStar} className="mr-2" /> Productos
                    más vendidos
                  </Link>
                  <Link
                    to={`/sync/reportes/ingreso-semana/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faCalendarWeek} className="mr-2" />{" "}
                    Ingresos totales por semana
                  </Link>
                  <Link
                    to={`/sync/reportes/estados-ordenes-anual/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Estados de órdenes Finalizadas (Entregados, No entregados,
                    Cancelados)
                  </Link>
                  <Link
                    to={`/sync/reportes/Reporte-Disponible/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Reporte de Disponibilidad
                  </Link>
                  <Link
                    to={`/sync/reportes/Reporte-Recepcion/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Reporte de Recepción
                  </Link>
                  <Link
                    to={`/sync/reportes/historial-Stock/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />{" "}
                    Historial Stock
                  </Link>
                  <Link
                    to={`/sync/reportes/stock-Critico/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />{" "}
                    Stock Critico
                  </Link>
                  <Link
                    to={`/sync/reportes/opiniones-clientes/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faComments} className="mr-2" />{" "}
                    Opiniones de clientes por producto
                  </Link>
                  <Link
                    to={`/sync/reportes/devoluciones-reembolsos/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faUndo} className="mr-2" />{" "}
                    Devoluciones o reembolsos por categoría
                  </Link>
                  <Link
                    to={`/sync/reportes/Despachar-Producto/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Productos a despachar
                  </Link>
                  <Link
                    to={`/sync/reportes/historial/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Historial despacho
                  </Link>
                  <Link
                    to={`/sync/reportes/plantillas/${selectedConnection}`}
                    className="list-group-item list-group-item-action"
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />{" "}
                    Plantilla
                  </Link>
                </div>
              </>
            )}
            <Link to="/sync/home" className="btn btn-primary mb-5">
              Volver a inicio
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default HomeReportes;
