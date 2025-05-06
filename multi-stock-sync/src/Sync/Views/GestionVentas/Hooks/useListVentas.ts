import { useState, useEffect } from 'react';
import axios from 'axios';
import { mockData,ListVentaService } from '../Services/listVentaService';
//datos a los que travez se va a filtrar
interface FiltrosVenta {
  clienteId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  totalMin?: number;
  totalMax?: number;
}

export const useListVentas = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);



// funcion para traer los datos desde el service y setear el loading y el error
  const fetchVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      //endpoint aun no terminada se cargan desde un json hardcode
      const response = ListVentaService.getListVenta();
      //const ventasData = response.data;
      //setAllData(ventasData);
      //setData(ventasData);

      // datos hardcode cargados de la constante mockData en service
      setAllData(mockData);
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar las ventas'));
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros en el frontend
  const aplicarFiltros = (filtros: FiltrosVenta) => {
    setLoading(true);
    
    try {
      //crea copia de los datos originales
      let resultados = [...allData];

      // Filtrar por cliente
      if (filtros.clienteId) {
        resultados = resultados.filter(
          (venta) => venta.cliente.id === filtros.clienteId
        );
      }

      // Filtrar por rango de fechas
      if (filtros.fechaInicio) {
        const fechaInicio = new Date(filtros.fechaInicio);
        resultados = resultados.filter(
          (venta) => new Date(venta.fecha) >= fechaInicio
        );
      }

      if (filtros.fechaFin) {
        const fechaFin = new Date(filtros.fechaFin);
        // Ajustar al final del día para incluir todas las ventas del día
        fechaFin.setHours(23, 59, 59, 999);
        resultados = resultados.filter(
          (venta) => new Date(venta.fecha) <= fechaFin
        );
      }

      // Filtrar por estado
      if (filtros.estado) {
        resultados = resultados.filter(
          (venta) => venta.estado === filtros.estado
        );
      }

      // Filtrar por rango de total
      if (filtros.totalMin !== undefined) {
        resultados = resultados.filter(
          (venta) => venta.total >= filtros.totalMin
        );
      }

      if (filtros.totalMax !== undefined) {
        resultados = resultados.filter(
          (venta) => venta.total <= filtros.totalMax
        );
      }
      // setea los nueos resultados
      setData(resultados);
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      setData(allData); // En caso de error, mostrar todos los datos
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    fetchVentas();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchVentas,
    aplicarFiltros
  };
};