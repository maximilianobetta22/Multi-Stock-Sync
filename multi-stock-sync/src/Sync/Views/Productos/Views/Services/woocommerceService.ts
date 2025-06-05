import axiosInstance from "../../../../../axiosConfig"
import type { WooCommerceProductsResponse } from "../Types/woocommerceTypes"
import type { WooCommerceCredentials } from "../Types/woocommerceTypes"

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`

export const WooCommerceService = {
  // Obtener productos de WooCommerce usando la conexión seleccionada
  async getProducts(): Promise<WooCommerceProductsResponse> {
    try {
      // Obtener la conexión seleccionada del localStorage
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada")
      if (!conexionSeleccionada) {
        throw new Error("No hay una conexión seleccionada")
      }

      const conexion = JSON.parse(conexionSeleccionada)
      const clientId = conexion.client_id || conexion.id

      if (!clientId) {
        throw new Error("No se pudo obtener el ID del cliente de la conexión seleccionada")
      }

      console.log(`Obteniendo productos WooCommerce para cliente: ${clientId}`)

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/woo/${clientId}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      console.log("Respuesta de productos WooCommerce:", response.data)

      // La respuesta tiene la estructura {user, total_products, products}
      return {
        user: response.data.user || "usuario@ejemplo.com",
        total_products: response.data.total_products || 0,
        products: response.data.products || [],
      }
    } catch (error: any) {
      console.error("Error al obtener productos de WooCommerce:", error)
      throw new Error(error.response?.data?.message || error.message || "Error al obtener los productos de WooCommerce")
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
