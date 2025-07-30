import axiosInstance from "../../../../../axiosConfig"

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`

// Tipos simplificados basados en la respuesta real del API
export interface MercadoLibreCategory {
  id: string
  name: string
}

export interface TemplateDownloadResponse {
  success: boolean
  filename: string
  message?: string
}

export const MercadoLibreService = {
  // Obtener categorías de Mercado Libre (usando conexión seleccionada)
  async getCategories(): Promise<MercadoLibreCategory[]> {
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

      console.log(`Obteniendo categorías para cliente: ${clientId}`)

      const response = await axiosInstance.get(`${API_BASE_URL}/mercadolibre/categorias/${clientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      console.log("Respuesta de categorías:", response.data)

      // Manejar diferentes formatos de respuesta
      let categories: MercadoLibreCategory[] = []

      if (Array.isArray(response.data)) {
        categories = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        categories = response.data.data
      } else if (response.data && response.data.categories) {
        categories = response.data.categories
      } else {
        throw new Error("Formato de respuesta inesperado")
      }

      // Validar que cada categoría tenga id y name
      const validCategories = categories.filter((cat) => cat.id && cat.name)

      console.log("Categorías procesadas:", validCategories)
      return validCategories
    } catch (error: any) {
      console.error("Error al obtener categorías de Mercado Libre:", error)
      throw new Error(
        error.response?.data?.message || error.message || "Error al obtener las categorías de Mercado Libre",
      )
    }
  },

  // Descargar plantilla de Excel para una categoría específica
  async downloadTemplate(categoryId: string): Promise<TemplateDownloadResponse> {
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

      console.log(`Descargando plantilla para categoría ${categoryId} y cliente ${clientId}`)

      const response = await axiosInstance.get(
        `${API_BASE_URL}/mercadolibre/carga-masiva/descargar-plantilla/${clientId}/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          responseType: "blob", // Importante para descargar archivos
        },
      )

      // Crear URL para descargar el archivo
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const downloadUrl = window.URL.createObjectURL(blob)

      // Generar nombre de archivo
      const filename = `plantilla_mercadolibre_${categoryId}_${new Date().getTime()}.xlsx`

      // Crear enlace temporal para descargar
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar URL temporal
      window.URL.revokeObjectURL(downloadUrl)

      return {
        success: true,
        filename,
        message: "Plantilla descargada correctamente",
      }
    } catch (error: any) {
      console.error("Error al descargar plantilla:", error)
      throw new Error(error.response?.data?.message || "Error al descargar la plantilla de Excel")
    }
  },
}
