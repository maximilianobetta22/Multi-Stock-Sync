// Tipos para la integración con WooCommerce
export interface WooCommerceCredentials {
  id?: string | number
  store_name: string
  store_url: string
  consumer_key: string
  consumer_secret: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface WooCommerceProduct {
  id: number
  name: string
  price: string
  stock_quantity: number
  permalink: string
  sku: string
  // Campos adicionales que podrían venir en la respuesta
  status?: string
  regular_price?: string
  on_sale?: boolean
  sale_price?: string
  description?: string
  short_description?: string
  categories?: WooCommerceCategory[]
  images?: WooCommerceImage[]
  weight?: string
  dimensions?: {
    length?: string
    width?: string
    height?: string
  }

  //  Para mostrar tallas
  attributes?: WooCommerceAttribute[]
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
  parent?: number
  description?: string
  count?: number
  image?: {
    id: number
    src: string
    alt: string
  }
  display?: string
  menu_order?: number
}

export interface WooCommerceTag {
  id: number
  name: string
  slug: string
}

export interface WooCommerceImage {
  id?: number
  date_created?: string
  date_modified?: string
  src: string
  name?: string
  alt?: string
  position?: number
}

export interface WooCommerceAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  slug: string
  variation: boolean
  options: string[]
}

export interface WooCommerceMetaData {
  id: number
  key: string
  value: string
}

export interface WooCommerceStore {
  id: string | number
  name: string
  nickname: string   
  client_id: string  
  url?: string
  status?: "active" | "inactive"
}

export interface WooCommerceProductsResponse {
  user: string
  total_products: number
  products: WooCommerceProduct[]
}

// Nuevos tipos para categorías
export interface WooCommerceCategoriesResponse {
  categories: WooCommerceCategory[]
  total_categories: number
  status: string
}

// Tipo para crear productos con imágenes
export interface CreateProductData {
  name: string
  type?: string
  regular_price: number
  sale_price?: number
  description?: string
  short_description?: string
  sku: string
  manage_stock?: boolean
  stock_quantity?: number
  stock_status?: string
  weight?: string
  dimensions?: {
    length?: string
    width?: string
    height?: string
  }
  status?: string
  featured?: boolean
  catalog_visibility?: string
  virtual?: boolean
  downloadable?: boolean
  reviews_allowed?: boolean
  tax_status?: string
  categories?: { id: number }[]
  tags?: { id: number }[]
  images?: WooCommerceImage[]
}