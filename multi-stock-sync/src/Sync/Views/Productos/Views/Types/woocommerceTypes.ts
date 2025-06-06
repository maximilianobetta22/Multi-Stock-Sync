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
  description?: string
  short_description?: string
  categories?: { id: number; name: string }[]
  images?: { id: number; src: string; alt: string }[]
  status?: string
  on_sale?: boolean
  regular_price?: string
  sale_price?: string
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
}

export interface WooCommerceTag {
  id: number
  name: string
  slug: string
}

export interface WooCommerceImage {
  id: number
  date_created: string
  date_modified: string
  src: string
  name: string
  alt: string
}

export interface WooCommerceAttribute {
  id: number
  name: string
  position: number
  visible: boolean
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
  url?: string
  status?: "active" | "inactive"
}

export interface WooCommerceProductsResponse {
  user: string
  total_products: number
  products: WooCommerceProduct[]
}
