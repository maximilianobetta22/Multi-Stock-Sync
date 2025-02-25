import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import 'bootstrap/dist/css/bootstrap.min.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, startOfWeek, endOfWeek } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const DetalleVentas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [yearSeleccionado, setYearSeleccionado] = useState<number>(new Date().getFullYear());
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(new Date().getMonth() + 1);
  const [ventas, setVentas] = useState<any[]>([]);

  // Estados para mostrar/ocultar filtros
  const [mostrarFiltroAño, setMostrarFiltroAño] = useState<boolean>(false);
  const [mostrarFiltroMes, setMostrarFiltroMes] = useState<boolean>(false);
  const [mostrarFiltroSemana, setMostrarFiltroSemana] = useState<boolean>(false);
  const [mostrarFiltroDia, setMostrarFiltroDia] = useState<boolean>(false);

  // Estado para el filtro de semana con calendario
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(new Date());

  // Obtener datos del usuario
  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      setUserData({
        nickname: response.data.data.nickname,
        profile_image: response.data.data.profile_image,
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      setError("Hubo un problema al cargar los datos del usuario.");
    } finally {
      setLoading(false);
    }
  }, [client_id]);

  // Obtener ventas del mes seleccionado
  const fetchVentas = useCallback(async () => {
    if (!client_id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}`, {
        params: {
          year: yearSeleccionado,
          month: monthSeleccionado.toString().padStart(2, '0')
        }
      });

      const ventasData = response.data.data?.[`${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}`]?.orders?.flatMap((order: any) =>
        order.sold_products.map((product: any) => ({
          order_id: product.order_id,
          order_date: product.order_date,
          title: product.title,
          quantity: product.quantity,
          price: product.price
        }))
      ) || [];

      setVentas(ventasData);
    } catch (error) {
      console.error('Error al obtener datos de ventas:', error);
      setError("Hubo un problema al obtener los datos de ventas.");
      setVentas([]);
    } finally {
      setLoading(false);
    }
  }, [client_id, yearSeleccionado, monthSeleccionado]);

  useEffect(() => {
    fetchUserData();
    fetchVentas();
  }, [fetchUserData, fetchVentas]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Detalle de Ventas</h1>
      {userData && (
        <div style={{ textAlign: "center" }}>
          <h3>Usuario: {userData.nickname}</h3>
          <img
            src={userData.profile_image}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
      )}

      <div className="row">
        {/* Filtros en la columna izquierda */}
        <div className="col-md-3 d-flex flex-column">
          <button className="btn btn-primary mb-2">Agregar Calendario Comparativo</button>

          {/* Filtro Año */}
          <button 
            className="btn btn-secondary mb-2"
            onClick={() => setMostrarFiltroAño(!mostrarFiltroAño)}
          >
            {mostrarFiltroAño ? "Ocultar Filtro por Año" : "Filtrar por Año"}
          </button>
          {mostrarFiltroAño && (
            <select className="form-select mb-2" value={yearSeleccionado} onChange={(e) => setYearSeleccionado(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {/* Filtro Mes */}
          <button 
            className="btn btn-secondary mb-2"
            onClick={() => setMostrarFiltroMes(!mostrarFiltroMes)}
          >
            {mostrarFiltroMes ? "Ocultar Filtro por Mes" : "Filtrar por Mes"}
          </button>
          {mostrarFiltroMes && (
            <select className="form-select mb-2" value={monthSeleccionado} onChange={(e) => setMonthSeleccionado(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          )}

          {/* Filtro Semana con Calendario */}
          <button className="btn btn-secondary mb-2" onClick={() => setMostrarFiltroSemana(!mostrarFiltroSemana)}>
            {mostrarFiltroSemana ? "Ocultar Filtro por Semana" : "Filtrar por Semana"}
          </button>
          {mostrarFiltroSemana && (
            <DatePicker
              selected={fechaSeleccionada}
              onChange={(date: Date | null) => setFechaSeleccionada(date)}
              dateFormat="yyyy-MM-dd"
              showWeekNumbers
              highlightDates={[startOfWeek(new Date()), endOfWeek(new Date())]}
              className="form-control mb-2"
            />
          )}

          {/* Filtro Día */}
          <button className="btn btn-secondary mb-2" onClick={() => setMostrarFiltroDia(!mostrarFiltroDia)}>
            {mostrarFiltroDia ? "Ocultar Filtro por Día" : "Filtrar por Día"}
          </button>
          {mostrarFiltroDia && (
            <input type="date" className="form-control mb-2" />
          )}
        </div>

        {/* Gráfico de Ventas */}
        <div className="col-md-9">
          <Bar
            data={{
              labels: ventas.map((v) => v.title),
              datasets: [
                {
                  label: "Ingresos",
                  data: ventas.map((v) => v.price * v.quantity),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default DetalleVentas;
