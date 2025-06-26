import { useState, useEffect } from "react"
import axiosInstance from "../../../../axiosConfig"
import axios from "axios"

interface Envio {
  id: string
  order_id: number
  title: string
  quantity: number
  size: string
  sku: string
  shipment_history: {
    status: string
    date_created?: string | null
  }
  clientName: string
  address: string
  receiver_name: string
  date_delivered?: string | null
}

interface UseObtenerEnviosResult {
  data: Envio[]
  loading: boolean
  error: string | null
  totalItems: number
}

const useObtenerEnviosPorCliente = (
  page: number,
  perPage: number,
  year?: number | null,
  month?: number | null,
): UseObtenerEnviosResult => {
  const [data, setData] = useState<Envio[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    try {
      const conexionSeleccionada = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")
      setClientId(conexionSeleccionada?.client_id || null)
    } catch (e) {
      console.error("Error al parsear conexionSeleccionada de localStorage:", e)
      setClientId(null)
    }
  }, [])

  useEffect(() => {
    const fetchShipments = async (
      id: string,
      page: number,
      perPage: number,
      year?: number | null,
      month?: number | null,
    ) => {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      if (!token) {
        setError("No tienes permiso para ver esto. Inicia sesión de nuevo.")
        setLoading(false)
        setTotalItems(0)
        return
      }

      const params: any = {
        page: page,
        perPage: perPage,
      }

      if (year != null) {
        params.year = year
      }
      if (month != null) {
        params.month = month
      }

      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/delivered-shipments/${id}`,
          {
            params: params,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (response.data && response.data.status === "success") {
          setData(response.data.data || [])
          setTotalItems(response.data.totalItems || 0)
        } else {
          setError(response.data?.message || "Error desconocido al obtener datos de envíos.")
          setData([])
          setTotalItems(0)
        }
      } catch (err: any) {
        console.error("Error en la obtención de envíos con axios:", err)

        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError(err.response.data?.message || "Acceso no autorizado. Inicia sesión de nuevo.")
          } else {
            setError(err.response.data?.message || `Error de la API: ${err.response.status}`)
          }
        } else {
          setError(err.message || "Error de internet al obtener datos de envíos.")
        }
        setData([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    }

    if (clientId && page >= 1 && perPage >= 1) {
      fetchShipments(clientId, page, perPage, year, month)
    } else if (localStorage.getItem("conexionSeleccionada") === null) {
      setError("No hay conexión seleccionada para obtener envíos.")
      setLoading(false)
      setTotalItems(0)
    } else {
      if (!clientId) {
        setLoading(true)
        setError(null)
        setData([])
        setTotalItems(0)
      }
    }
  }, [clientId, page, perPage, year, month])

  return { data, loading, error, totalItems }
}

export default useObtenerEnviosPorCliente
