// src/Sync/Views/Reportes/Views/Ventas_Reportes/Venta.tsx

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

import FiltrosVentas from "./components/FiltrosVentas";
import TablaVentas from "./components/TablaVentas";
import GraficoVentas from "./components/GraficoVentas";
import { generarPDFVentas, exportarVentasAExcel, formatCurrency } from "./utils/exportUtils";

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

const Venta: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [yearSeleccionado, setYearSeleccionado] = useState<number>(currentYear);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(new Date().getMonth() + 1);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<"mes" | "año" | null>(null);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const years = useMemo(() =>
    Array.from({ length: 10 }, (_, i) =>
      (new Date().getFullYear() - i).toString()), []);

  const totalIngresos = useMemo(() =>
    ventas.reduce((total, venta) => total + venta.price * venta.quantity, 0), [ventas]);

  const params = {
    year: yearSeleccionado,
    month: monthSeleccionado.toString().padStart(2, "0"),
  };

  const fetchVentas = useCallback(async () => {
    if (!client_id) return;
    setLoading(true);
    try {
      let apiUrl = "";
      if (filtroActivo === "mes") {
        apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}?year=${params.year}&month=${params.month}`;
      } else if (filtroActivo === "año") {
        apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/annual-sales/${client_id}?year=${params.year}`;
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
        const dataMes = ventasData[`${params.year}-${params.month}`]?.orders || [];
        setVentas(formatearVentas(dataMes));
      } else if (filtroActivo === "año") {
        const dataYear = Object.keys(ventasData).flatMap(month => ventasData[month].orders);
        setVentas(formatearVentas(dataYear));
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setVentas([]);
      setToastMessage("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  }, [client_id, params, filtroActivo]);

  useEffect(() => {
    if (filtroActivo) fetchVentas();
  }, [filtroActivo, fetchVentas]);

  useEffect(() => {
    if (!filtroActivo) setVentas([]);
  }, [filtroActivo]);

  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      setUserData({
        nickname: res.data.data.nickname,
        profile_image: res.data.data.profile_image,
      });
    } catch (err) {
      console.error("Error al obtener usuario:", err);
    }
  }, [client_id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePDF = () => {
    const pdf = generarPDFVentas(ventas, userData, yearSeleccionado);
    setPdfDataUrl(pdf);
    setShowModal(true);
  };

  const handleExcel = () => {
    exportarVentasAExcel(ventas, yearSeleccionado);
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}

      <div className="container mt-4">
        {toastMessage && (
          <ToastComponent message={toastMessage} type="danger" onClose={() => setToastMessage(null)} />
        )}

        <h1 className="text-center mb-4">Detalles de Ventas</h1>
        {userData && <h3 className="text-center">Usuario: {userData.nickname}</h3>}

        <div className="d-flex justify-content-center mb-4">
          <Link to="/sync/home" className="btn btn-primary mb-4">Volver a inicio</Link>
        </div>

        {/* Comparaciones */}
        <h4 className="text-center">Reportes de Comparaciones</h4>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Button variant="outline-primary" onClick={() => navigate(`/sync/reportes/compare-month-month/${client_id}`)}>
            <FontAwesomeIcon icon={faCalendarDays} className="me-2" /> Comparar Meses
          </Button>
          <Button variant="outline-primary" onClick={() => navigate(`/sync/reportes/compare-year-year/${client_id}`)}>
            <FontAwesomeIcon icon={faCalendar} className="me-2" /> Comparar Años
          </Button>
        </div>

        {/* Filtros */}
        <h4 className="text-center mb-3">Filtros disponibles</h4>
        <FiltrosVentas
          filtroActivo={filtroActivo}
          setFiltroActivo={setFiltroActivo}
          yearSeleccionado={yearSeleccionado}
          setYearSeleccionado={setYearSeleccionado}
          monthSeleccionado={monthSeleccionado}
          setMonthSeleccionado={setMonthSeleccionado}
          years={years}
        />

        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <Button variant="success" onClick={fetchVentas}>
              <FontAwesomeIcon icon={faFilter} className="me-2" /> Consultar Datos
            </Button>
          </Col>
        </Row>

        {!loading && filtroActivo && ventas.length > 0 && (
          <>
            <div className="my-4">
              <GraficoVentas ventas={ventas} />
            </div>

            <TablaVentas ventas={ventas} formatCurrency={formatCurrency} />
            <h4 className="text-center mt-4">Total: ${totalIngresos.toLocaleString("es-CL")} CLP</h4>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="primary" onClick={handlePDF}>
                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Generar PDF
              </Button>
              <Button variant="secondary" onClick={handleExcel}>
                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Exportar Excel
              </Button>
            </div>
          </>
        )}

        {/* Modal PDF */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pdfDataUrl && <iframe src={pdfDataUrl} width="100%" height="500px" />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
            <Button variant="primary" onClick={() => {
              const link = document.createElement("a");
              link.href = pdfDataUrl!;
              link.download = `Ventas_${yearSeleccionado}.pdf`;
              link.click();
            }}>Guardar PDF</Button>
          </Modal.Footer>
        </Modal>

        <footer className="text-center mt-5">
          <p>-------- Multi Stock Sync --------</p>
        </footer>
      </div>
    </>
  );
};

export default Venta;
