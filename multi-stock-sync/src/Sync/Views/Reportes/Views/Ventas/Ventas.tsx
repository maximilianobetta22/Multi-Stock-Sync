import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Row, Col, Modal } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCalendar,
  faFilter,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

import FiltrosVentas from "./FiltrosVentas";
import TablaVentas from "./TablaVentas";
import GraficoVentas from "./GraficoVentas";
import { generarPDFVentas, exportarVentasAExcel, formatCurrency } from "./exportUtils";

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

const DetallesDeVentas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [yearSeleccionado, setYearSeleccionado] = useState<number>(currentYear);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(
    new Date().getMonth() + 1
  );
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<"mes" | "año" | null>(null);
  const [userData, setUserData] = useState<{
    nickname: string;
    profile_image: string;
  } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Años disponibles para el selector (últimos 10)
  const years = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
      ),
    []
  );

  // Calcula el total de ingresos con base en los datos cargados
  const totalIngresos = useMemo(
    () =>
      ventas.reduce((total, venta) => total + venta.price * venta.quantity, 0),
    [ventas]
  );

  const params = {
    year: yearSeleccionado,
    month: monthSeleccionado.toString().padStart(2, "0"),
  };

  // Obtiene los datos de ventas desde la API según el filtro activo
  const fetchVentas = useCallback(async () => {
    if (!client_id) return;
    setLoading(true);
    try {
      let apiUrl = "";
      if (filtroActivo === "mes") {
        apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}?year=${params.year}&month=${params.month}`;
      } else if (filtroActivo === "año") {
        apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/annual-sales/${client_id}?year=${yearSeleccionado}`;
      }

      const response = await axiosInstance.get(apiUrl);
      const ventasData = response.data.data;

      const formatearVentas = (data: any) =>
        data.flatMap((order: any) =>
          order.sold_products.map((product: any) => ({
            order_id: product.order_id,
            order_date: product.order_date,
            title: product.title,
            quantity: product.quantity,
            price: product.price,
          }))
        );

      if (filtroActivo === "mes") {
        const dataMes =
          ventasData[`${yearSeleccionado}-${params.month}`]?.orders || [];
        setVentas(formatearVentas(dataMes));
      } else if (filtroActivo === "año") {
        const dataYear = Object.keys(ventasData).flatMap(
          (month) => ventasData[month].orders
        );
        setVentas(formatearVentas(dataYear));
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setVentas([]);
      setToastMessage("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  }, [client_id, yearSeleccionado, monthSeleccionado, filtroActivo]);

  useEffect(() => {
    if (filtroActivo === "mes" || filtroActivo === "año") {
      fetchVentas();
    }
  }, [fetchVentas, filtroActivo]);

  useEffect(() => {
    if (filtroActivo === null) {
      setVentas([]);
    }
  }, [filtroActivo]);

  // Obtiene datos del usuario (nickname y avatar) al montar
  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      setUserData({
        nickname: response.data.data.nickname,
        profile_image: response.data.data.profile_image,
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, [client_id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Genera el PDF con los datos cargados
  const generatePDF = () => {
    const pdfData = generarPDFVentas(ventas, userData, yearSeleccionado);
    setPdfDataUrl(pdfData);
    setShowModal(true);
  };

  // Exporta los datos en formato Excel
  const exportToExcel = () => {
    exportarVentasAExcel(ventas, yearSeleccionado);
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      <div className="container mt-4">
        {toastMessage && (
          <ToastComponent
            message={toastMessage}
            type="danger"
            onClose={() => setToastMessage(null)}
          />
        )}

        <h1 className="text-center mb-4">Detalles de Ventas</h1>
        {userData && (
          <div style={{ textAlign: "center" }}>
            <h3>Usuario: {userData.nickname}</h3>
          </div>
        )}

        <div className="d-flex justify-content-center mb-4">
          <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">
            Volver a inicio
          </Link>
        </div>

        {/* Botones para comparar periodos */}
        <h4 className="d-flex justify-content-center gap-3 mb-4">
          Reportes de Comparaciones
        </h4>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center"
            onClick={() =>
              navigate(`/sync/reportes/compare-month-month/${client_id}`)
            }
          >
            <FontAwesomeIcon icon={faCalendarDays} className="me-2" /> Comparar meses
          </Button>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center"
            onClick={() =>
              navigate(`/sync/reportes/compare-year-year/${client_id}`)
            }
          >
            <FontAwesomeIcon icon={faCalendar} className="me-2" /> Comparar años
          </Button>
        </div>

        {/* Filtros dinámicos por mes o año */}
        <h4 className="d-flex justify-content-center gap-3 mb-4">
          Filtros disponibles
        </h4>

        <FiltrosVentas
          filtroActivo={filtroActivo}
          setFiltroActivo={setFiltroActivo}
          yearSeleccionado={yearSeleccionado}
          setYearSeleccionado={setYearSeleccionado}
          monthSeleccionado={monthSeleccionado}
          setMonthSeleccionado={setMonthSeleccionado}
          years={years}
        />

        {/* Botón para consultar los datos según el filtro */}
        <Row className="d-flex justify-content-center mt-3">
          <Col xs="auto">
            <Button
              variant="success"
              onClick={fetchVentas}
              className="d-flex align-items-center"
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" /> Consultar Datos
            </Button>
          </Col>
        </Row>

        {filtroActivo && !loading && (
          <>
            {ventas.length > 0 && (
              <div className="mb-4">
                <GraficoVentas ventas={ventas} />
              </div>
            )}

            <TablaVentas ventas={ventas} formatCurrency={formatCurrency} />

            <h4 className="text-center mt-3">
              Total de ingresos: ${totalIngresos.toLocaleString("es-CL")}
            </h4>

            {/* Botones de exportación */}
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="primary"
                onClick={generatePDF}
                className="mr-2 mx-3 d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Generar PDF
              </Button>
              <Button
                variant="secondary"
                onClick={exportToExcel}
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Guardar Excel
              </Button>
            </div>
          </>
        )}

        {/* Modal que muestra el PDF generado */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Reporte de Ventas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pdfDataUrl && (
              <iframe src={pdfDataUrl} width="100%" height="500px" />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfDataUrl!;
                link.download = `Ventas_${yearSeleccionado}.pdf`;
                link.click();
              }}
            >
              Guardar PDF
            </Button>
          </Modal.Footer>
        </Modal>

        <footer className="text-center mt-5">
          <p>----------Multi Stock Sync----------</p>
        </footer>
      </div>
    </>
  );
};

export default DetallesDeVentas;
