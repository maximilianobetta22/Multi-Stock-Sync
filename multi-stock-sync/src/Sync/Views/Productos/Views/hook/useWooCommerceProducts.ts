import { useState, useEffect, useCallback } from "react"
import { WooCommerceService } from "../Services/woocommerceService"
import type { WooCommerceProduct } from "../Types/woocommerceTypes"

interface UseWooCommerceProductsParams {
  autoLoad?: boolean
}

const useWooCommerceProducts = ({ autoLoad = false }: UseWooCommerceProductsParams = {}) => {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [connectionInfo, setConnectionInfo] = useState<any>(null)

  // Verificar si hay conexión seleccionada
  const hasSelectedConnection = useCallback(() => {
    return WooCommerceService.hasSelectedConnection()
  }, [])

  // Obtener información de la conexión
  const getConnectionInfo = useCallback(() => {
    const connection = WooCommerceService.getSelectedConnection()
    setConnectionInfo(connection)
    return connection
  }, [])

  // Cargar productos de WooCommerce
  const loadProducts = useCallback(async () => {
    if (!hasSelectedConnection()) {
      setProducts([])
      setTotalProducts(0)
      setUserEmail("")
      setError("No hay una conexión seleccionada")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await WooCommerceService.getProducts()
      setProducts(response.products || [])
      setTotalProducts(response.total_products || 0)
      setUserEmail(response.user || "")
    } catch (err: any) {
      console.error("Error en loadProducts:", err)
      setError(err.message || "Error al cargar los productos WooCommerce")
      setProducts([])
      setTotalProducts(0)
      setUserEmail("")
    } finally {
      setLoading(false)
    }
  }, [hasSelectedConnection])

  // Cargar información de conexión al montar
  useEffect(() => {
    getConnectionInfo()
  }, [getConnectionInfo])

  // Cargar productos automáticamente si autoLoad es true
  useEffect(() => {
    if (autoLoad && hasSelectedConnection()) {
      loadProducts()
    }
  }, [autoLoad, hasSelectedConnection, loadProducts])

  return {
    products,
    totalProducts,
    userEmail,
    connectionInfo,
    loading,
    error,
    hasSelectedConnection,
    loadProducts,
    getConnectionInfo,
    clearError: () => setError(undefined),
  }
}

export default useWooCommerceProducts
