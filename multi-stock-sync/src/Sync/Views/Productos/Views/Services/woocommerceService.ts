import axiosInstance from "../../../../../axiosConfig"
import type { WooCommerceProductsResponse } from "../Types/woocommerceTypes"
import type { WooCommerceCredentials } from "../Types/woocommerceTypes"

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`

// Mapeo de client_id/nickname a ID de WooCommerce
const WOOCOMMERCE_STORE_MAPPING: Record<string, number> = {
  // Por nickname
  OFERTASIMPERDIBLESCHILE: 1,
  ofertasimperdibles: 1,
  LENCERIAONLINE: 2,
  lenceriaonline: 2,
  CRAZYFAMILY: 3,
  crazyfamily: 3,
  COMERCIALIZADORAABIZICL: 4, // Nickname real de Abizi
  ABIZI: 4,
  abizi: 4,

  // Por client_id (si es necesario)
  "831219417629855": 1, // OFERTASIMPERDIBLESCHILE
  "736561022928727": 2, // LENCERIAONLINE
  "582209517920790": 4, // COMERCIALIZADORAABIZICL (Abizi)
  // Agrega más client_ids según sea necesario
}

export const WooCommerceService = {
  // Función para mapear conexión a ID de WooCommerce
  getWooCommerceStoreId(conexion: any): number | null {
    // Intentar por nickname primero
    if (conexion.nickname) {
      const storeId =
        WOOCOMMERCE_STORE_MAPPING[conexion.nickname.toLowerCase()] ||
        WOOCOMMERCE_STORE_MAPPING[conexion.nickname.toUpperCase()]
      if (storeId) {
        console.log(`Mapeado por nickname "${conexion.nickname}" -> ID ${storeId}`)
        return storeId
      }
    }

    // Intentar por client_id
    if (conexion.client_id) {
      const storeId = WOOCOMMERCE_STORE_MAPPING[conexion.client_id.toString()]
      if (storeId) {
        console.log(`Mapeado por client_id "${conexion.client_id}" -> ID ${storeId}`)
        return storeId
      }
    }

    // Intentar por id
    if (conexion.id) {
      const storeId = WOOCOMMERCE_STORE_MAPPING[conexion.id.toString()]
      if (storeId) {
        console.log(`Mapeado por id "${conexion.id}" -> ID ${storeId}`)
        return storeId
      }
    }

    console.warn("No se pudo mapear la conexión a un ID de WooCommerce:", conexion)
    return null
  },

  // Obtener productos de WooCommerce usando la conexión seleccionada
  async getProducts(): Promise<WooCommerceProductsResponse> {
    try {
      // Obtener la conexión seleccionada del localStorage
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada")
      if (!conexionSeleccionada) {
        throw new Error("No hay una conexión seleccionada")
      }

      const conexion = JSON.parse(conexionSeleccionada)
      console.log("Conexión seleccionada:", conexion)

      // Mapear la conexión al ID correcto de WooCommerce
      const wooStoreId = this.getWooCommerceStoreId(conexion)

      if (!wooStoreId) {
        throw new Error(
          `No se pudo mapear la conexión "${conexion.nickname || conexion.client_id}" a un ID de WooCommerce válido`,
        )
      }

      console.log(`Obteniendo productos WooCommerce para tienda ID: ${wooStoreId}`)

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/woo/${wooStoreId}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        timeout: 100000000, 
      })

      console.log("Respuesta de productos WooCommerce:", response.data)

      // Verificar si la respuesta tiene la estructura esperada
      if (!response.data) {
        throw new Error("Respuesta vacía del servidor")
      }

      // La respuesta tiene la estructura {user, total_products, products}
      return {
        user: response.data.user || "usuario@ejemplo.com",
        total_products: response.data.total_products || 0,
        products: response.data.products || [],
      }
    } catch (error: any) {
      console.error("Error al obtener productos de WooCommerce:", error)

      // Manejar diferentes tipos de errores
      if (error.code === "ECONNABORTED") {
        throw new Error("Timeout: La petición tardó demasiado en responder")
      }

      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message || error.message

        switch (status) {
          case 404:
            throw new Error(`Tienda no encontrada. Verifica que el mapeo de la tienda sea correcto.`)
          case 503:
            throw new Error("Servicio no disponible. El servidor está temporalmente fuera de servicio.")
          case 500:
            throw new Error(`Error interno del servidor: ${message}`)
          default:
            throw new Error(`Error ${status}: ${message}`)
        }
      }

      if (error.request) {
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.")
      }

      throw new Error(error.message || "Error desconocido al obtener los productos de WooCommerce")
    }
  },

  // Verificar si hay una conexión seleccionada
  hasSelectedConnection(): boolean {
    try {
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada")
      return !!conexionSeleccionada
    } catch (error) {
      return false
    }
  },

  // Obtener información de la conexión seleccionada
  getSelectedConnection(): any {
    try {
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada")
      if (!conexionSeleccionada) return null

      return JSON.parse(conexionSeleccionada)
    } catch (error) {
      return null
    }
  },

  // Obtener el ID mapeado de WooCommerce para la conexión actual
  getCurrentWooCommerceStoreId(): number | null {
    const conexion = this.getSelectedConnection()
    if (!conexion) return null

    return this.getWooCommerceStoreId(conexion)
  },

  // Probar conexión con diferentes IDs
  async testConnectionWithId(testId: string | number): Promise<boolean> {
    try {
      console.log(`Probando conexión con ID: ${testId}`)

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/woo/${testId}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        timeout: 10000, // 10 segundos para prueba
      })

      return response.status === 200 && response.data
    } catch (error) {
      console.log(`ID ${testId} no funciona:`, error.response?.status || error.message)
      return false
    }
  },

  // Obtener todas las tiendas disponibles basadas en el mapeo
  getAvailableStores(): Array<{ id: number; name: string; nickname: string }> {
    return [
      { id: 1, name: "Ofertas Imperdibles", nickname: "OFERTASIMPERDIBLESCHILE" },
      { id: 2, name: "Lencería Online", nickname: "LENCERIAONLINE" },
      { id: 3, name: "Crazy Family", nickname: "CRAZYFAMILY" },
      { id: 4, name: "Comercializadora Abizi", nickname: "COMERCIALIZADORAABIZICL" },
    ]
  },

  // Configurar credenciales de WooCommerce
  async saveCredentials(credentials: Omit<WooCommerceCredentials, "id">): Promise<WooCommerceCredentials> {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/woocommerce/credentials`, credentials, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.data && response.data.data) {
        return response.data.data as WooCommerceCredentials
      } else {
        throw new Error("Respuesta inesperada del servidor al guardar credenciales")
      }
    } catch (error: any) {
      console.error("Error al guardar credenciales de WooCommerce:", error)
      throw new Error(error.response?.data?.message || "Error al guardar las credenciales de WooCommerce")
    }
  },

  // Probar conexión con WooCommerce
  async testConnection(credentials: Omit<WooCommerceCredentials, "id">): Promise<boolean> {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/woocommerce/test-connection`, credentials, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      return response.data?.success === true
    } catch (error: any) {
      console.error("Error al probar conexión con WooCommerce:", error)
      throw new Error(error.response?.data?.message || "Error al conectar con la tienda WooCommerce")
    }
  },
}
