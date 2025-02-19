import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../axiosConfig';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Función para obtener los años disponibles
const obtenerAnios = () => {
  const anioActual = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => anioActual - i);
};

// Función para determinar si un año es bisiesto
const esBisiesto = (anio: number) => {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
};

// Función para obtener la cantidad de días según el mes y el año
const obtenerDiasDelMes = (mes: number, anio: number) => {
  const diasPorMes: { [key: number]: number } = {
    1: 31, 2: esBisiesto(anio) ? 29 : 28, 3: 31, 4: 30,
    5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
  };
  return diasPorMes[mes];
};

const DetalleVentas: React.FC = () => {
  const [filtro, setFiltro] = useState<string>('dia');
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [dia, setDia] = useState<number>(new Date().getDate());
  const [ventasTotales, setVentasTotales] = useState<number>(0);
  const [unidadesVendidas, setUnidadesVendidas] = useState<number>(0);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ajustar día si el mes cambia y el día actual no es válido en el nuevo mes
    const maxDias = obtenerDiasDelMes(mes, anio);
    if (dia > maxDias) setDia(maxDias);
  }, [mes, anio]);

  const fetchDetalleVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { filtro, anio };
      if (filtro === 'dia') params.dia = dia;
      if (filtro !== 'anio') params.mes = mes;

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/detalle-ventas`,
        { params }
      );
      const result = response.data;

      setVentasTotales(result.ventasTotales);
      setUnidadesVendidas(result.unidadesVendidas);
      setChartData({
        labels: result.productos.map((prod: any) => prod.nombre),
        datasets: [
          {
            label: 'Ventas Totales',
            data: result.productos.map((prod: any) => prod.total),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
          {
            label: 'Unidades Vendidas',
            data: result.productos.map((prod: any) => prod.unidades),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      setError('Error al obtener los detalles de ventas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalleVentas();
  }, [filtro, dia, mes, anio]);
  

  return (
    <div>
      <h2>Detalle de Ventas</h2>

      {/* Selección de Filtros */}
      <div className="form-group">
        <label>Seleccionar Filtro:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="form-control">
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="anio">Año</option>
        </select>
      </div>

      {/* Selección de Día (solo si el filtro es "día") */}
      {filtro === 'dia' && (
        <div className="form-group">
          <label>Seleccionar Día:</label>
          <select value={dia} onChange={(e) => setDia(Number(e.target.value))} className="form-control">
            {Array.from({ length: obtenerDiasDelMes(mes, anio) }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selección de Mes (para día y mes) */}
      {filtro !== 'anio' && (
        <div className="form-group">
          <label>Seleccionar Mes:</label>
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="form-control">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selección de Año (para todos los filtros) */}
      <div className="form-group">
        <label>Seleccionar Año:</label>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className="form-control">
          {obtenerAnios().map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>


      {loading ? (
        <LoadingDinamico variant="container" />
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div>
          <div className="ventas-resumen">
            <h3>Ventas Totales: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ventasTotales)}</h3>
            <h3>Unidades Vendidas: {unidadesVendidas}</h3>
          </div>

          
          <div style={{ width: "600px", height: "400px", marginTop: "2rem" }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleVentas;
