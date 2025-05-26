"use client"

import { useState, useEffect } from "react"

export interface StockCriticItem {
  id: string
  title: string
  available_quantity: number
  price: number
  permalink: string
}

export function useStockCritic(clientId?: number) {
  const [data, setData] = useState<StockCriticItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) {
      setLoading(false)
      setData([])
      return
    }

    setLoading(true)
    setError(null)

    const token = localStorage.getItem("token")
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

    fetch(`${API_BASE_URL}/mercadolibre/stock-critic/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((json) => {
            throw new Error(json.message || "Error al obtener stock crítico")
          })
        }
        return res.json()
      })
      .then((json) => {
        if (json.data && Array.isArray(json.data.productos)) {
          setData(json.data.productos)
        } else {
          setData([])
        }
        setError(null)
      })
      .catch((err) => {
        console.error("Error fetching stock critic:", err)
        setError(err.message)
        setData([])
      })
      .finally(() => setLoading(false))
  }, [clientId])

  return { data, loading, error }
}
