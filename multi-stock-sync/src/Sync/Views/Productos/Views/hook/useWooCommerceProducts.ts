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

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)

  const hasSelectedConnection = useCallback(() => {
    return WooCommerceService.hasSelectedConnection()
  }, [])

  const getConnectionInfo = useCallback(() => {
    const connection = WooCommerceService.getSelectedConnection()
    setConnectionInfo(connection)
    return connection
  }, [])

  const loadProducts = useCallback(
    async (page = 1, perPage = 50) => {
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
        const storeId = WooCommerceService.getCurrentWooCommerceStoreId()
        if (storeId === null) {
          throw new Error("No se encontró un Store ID válido")
        }

        const response = await WooCommerceService.getProducts({ storeId, page, perPage })

        // Verifica que el backend devuelva total_products correctamente
        if (typeof response.total_products !== "number") {
          console.warn("El backend no devolvió total_products correctamente:", response)
        }

        setProducts(response.products || [])
        setTotalProducts(response.total_products || 0)
        setUserEmail(response.user || "")
        setCurrentPage(page)
        setPageSize(perPage)
      } catch (err: any) {
        setError(err.message || "Error al cargar los productos WooCommerce")
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    },
    [hasSelectedConnection]
  )

  useEffect(() => {
    getConnectionInfo()
  }, [getConnectionInfo])

  useEffect(() => {
    if (autoLoad && hasSelectedConnection()) {
      loadProducts(currentPage, pageSize)
    }
  }, [autoLoad, hasSelectedConnection, loadProducts, currentPage, pageSize])

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
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    clearError: () => setError(undefined),
  }
}

export default useWooCommerceProducts
