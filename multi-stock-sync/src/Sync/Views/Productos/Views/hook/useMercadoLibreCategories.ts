import { useState, useEffect, useCallback, useMemo } from "react"
import { MercadoLibreService } from "../Services/mercadoLibreService"
import type { MercadoLibreCategory, CategoryTreeNode, TemplateDownloadResponse } from "../Types/mercadoLibreTypes"

interface UseMercadoLibreCategoriesParams {
  autoLoad?: boolean
}

const useMercadoLibreCategories = ({ autoLoad = true }: UseMercadoLibreCategoriesParams) => {
  const [categories, setCategories] = useState<MercadoLibreCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  // Verificar si hay conexión seleccionada
  const hasSelectedConnection = useCallback(() => {
    try {
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada")
      return !!conexionSeleccionada
    } catch (error) {
      return false
    }
  }, [])

  // Convertir categorías a formato de árbol para Ant Design Tree (simplificado)
  const treeData = useMemo((): CategoryTreeNode[] => {
    return categories.map((category) => ({
      key: category.id,
      title: category.name,
      categoryId: category.id,
      isLeaf: true, // Todas las categorías son hojas ya que no hay subcategorías
    }))
  }, [categories])

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    if (!hasSelectedConnection()) {
      setCategories([])
      setError("No hay una conexión seleccionada")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const categoriesData = await MercadoLibreService.getCategories()
      setCategories(categoriesData)
      console.log("Categorías cargadas:", categoriesData)
    } catch (err: any) {
      setError(err.message || "Error al cargar las categorías")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [hasSelectedConnection])

  // Descargar plantilla
  const downloadTemplate = useCallback(
    async (categoryId: string): Promise<TemplateDownloadResponse | null> => {
      if (!hasSelectedConnection()) {
        setError("No hay una conexión seleccionada")
        return null
      }

      setDownloadingTemplate(true)
      setError(undefined)

      try {
        const result = await MercadoLibreService.downloadTemplate(categoryId)
        return result
      } catch (err: any) {
        setError(err.message || "Error al descargar la plantilla")
        return null
      } finally {
        setDownloadingTemplate(false)
      }
    },
    [hasSelectedConnection],
  )

  // Buscar categoría por ID (simplificado)
  const findCategoryById = useCallback(
    (categoryId: string): { category: MercadoLibreCategory | null } => {
      const category = categories.find((cat) => cat.id === categoryId)
      return { category: category || null }
    },
    [categories],
  )

  // Obtener estadísticas de categorías (simplificado)
  const categoryStats = useMemo(() => {
    return {
      totalCategories: categories.length,
      totalSubcategories: 0, // No hay subcategorías
      totalItems: 0, // No tenemos esta información
      categoriesWithChildren: 0, // No hay subcategorías
    }
  }, [categories])

  // Cargar categorías automáticamente
  useEffect(() => {
    if (autoLoad && hasSelectedConnection()) {
      loadCategories()
    } else if (!hasSelectedConnection()) {
      setCategories([])
      setError(undefined)
    }
  }, [autoLoad, hasSelectedConnection, loadCategories])

  return {
    categories,
    treeData,
    loading,
    error,
    selectedCategory,
    downloadingTemplate,
    categoryStats,
    loadCategories,
    downloadTemplate,
    findCategoryById,
    setSelectedCategory,
    clearError: () => setError(undefined),
  }
}

export default useMercadoLibreCategories
