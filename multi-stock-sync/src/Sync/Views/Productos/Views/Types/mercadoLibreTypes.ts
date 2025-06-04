// Tipos simplificados para la integración con Mercado Libre
export interface MercadoLibreCategory {
  id: string
  name: string
}

export interface CategoryTreeNode {
  key: string
  title: string
  children?: CategoryTreeNode[]
  isLeaf?: boolean
  categoryId: string
}

export interface TemplateDownloadResponse {
  success: boolean
  filename: string
  downloadUrl?: string
  message?: string
}
