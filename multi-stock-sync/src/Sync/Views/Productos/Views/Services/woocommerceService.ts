import axiosInstance from "../../../../../axiosConfig"
import axios from 'axios';
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
  COMERCIALIZADORAABIZICL: 4, 
  ABIZI: 4,
  abizi: 4,
}

// Interface para categorías
export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image?: {
    id: number;
    src: string;
    alt: string;
  };
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

  // NUEVA: Obtener categorías de WooCommerce
  async getCategories({ storeId, page = 1, perPage = 100 }: { storeId: number; page?: number; perPage?: number }): Promise<{ categories: WooCommerceCategory[]; total_categories: number }> {
    try {
      console.log(`📦 Obteniendo categorías WooCommerce para tienda ID: ${storeId}`)

      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/category/${storeId}/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
        params: {
          page,
          per_page: perPage,
          orderby: 'name',
          order: 'asc',
        },
        timeout: 10000,
      })

      console.log("📦 Respuesta de categorías WooCommerce:", response.data)

      return {
        categories: response.data.categories || [],
        total_categories: response.data.total_categories || 0,
      }
    } catch (error: any) {
      console.error("❌ Error al obtener categorías de WooCommerce:", error)

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

      throw new Error(error.message || "Error desconocido al obtener las categorías de WooCommerce")
    }
  },

  // Obtener productos de WooCommerce usando la conexión seleccionada
  async getProducts({ storeId, page = 1, perPage = 50 }: { storeId: number; page?: number; perPage?: number }): Promise<WooCommerceProductsResponse> {
    try {
      console.log(`Obteniendo productos WooCommerce para tienda ID: ${storeId}, página ${page}`)

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/woo/${storeId}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          page,
          per_page: perPage,
        },
        timeout: 10000,
      })

      console.log("Respuesta de productos WooCommerce:", response.data)

      return {
        user: response.data.user || "usuario@ejemplo.com",
        total_products: response.data.total_products || 0,
        products: response.data.products || [],
      }
    } catch (error: any) {
      console.error("Error al obtener productos de WooCommerce:", error)

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
  
  // FUNCIÓN MEJORADA: Crear producto en WooCommerce
  async createProduct({ storeId, productData }: { storeId: number; productData: any }): Promise<any> {
    try {
      console.log(`🚀 WooCommerceService: Creando producto en tienda ID: ${storeId}`);
      console.log("📋 WooCommerceService: Datos del producto:", productData);

      // Validar datos antes de enviar
      if (!productData.name || productData.name.trim() === '') {
        throw new Error('El nombre del producto es obligatorio');
      }

      if (!productData.sku || productData.sku.trim() === '') {
        throw new Error('El SKU del producto es obligatorio');
      }

      if (!productData.regular_price || productData.regular_price <= 0) {
        throw new Error('El precio del producto debe ser mayor a 0');
      }

      // Función helper para limpiar números como strings (para WooCommerce API)
      const cleanNumberAsString = (value: any) => {
        if (value === null || value === undefined || value === '' || value === 0) return undefined;
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num.toString();
      };

      // Preparar dimensiones (como strings según WooCommerce API)
      const dimensions: any = {};
      const length = cleanNumberAsString(productData.dimensions?.length);
      const width = cleanNumberAsString(productData.dimensions?.width);
      const height = cleanNumberAsString(productData.dimensions?.height);
      
      if (length !== undefined) dimensions.length = length;
      if (width !== undefined) dimensions.width = width;
      if (height !== undefined) dimensions.height = height;

      // Limpiar y preparar los datos según la API de WooCommerce
      const cleanedData: any = {
        name: productData.name.trim(),
        type: productData.type || "simple",
        regular_price: productData.regular_price.toString(), // WooCommerce espera STRING
        description: productData.description || "",
        short_description: productData.short_description || "",
        sku: productData.sku.trim(),
        manage_stock: Boolean(productData.manage_stock),
        stock_status: productData.stock_status || "instock",
        status: productData.status || "publish",
        featured: Boolean(productData.featured),
        catalog_visibility: productData.catalog_visibility || "visible",
        virtual: Boolean(productData.virtual),
        downloadable: Boolean(productData.downloadable),
        reviews_allowed: Boolean(productData.reviews_allowed !== false),
        tax_status: productData.tax_status || "taxable",
        categories: productData.categories || [],
        tags: productData.tags || [],
        images: productData.images || [],
      };

      // Solo agregar campos opcionales si tienen valores válidos (como strings)
      const salePrice = cleanNumberAsString(productData.sale_price);
      if (salePrice !== undefined) {
        cleanedData.sale_price = salePrice;
      }

      const weight = cleanNumberAsString(productData.weight);
      if (weight !== undefined) {
        cleanedData.weight = weight;
      }

      // Solo agregar dimensiones si al menos una tiene valor
      if (Object.keys(dimensions).length > 0) {
        cleanedData.dimensions = dimensions;
      }

      // Solo agregar stock_quantity si manage_stock está habilitado (como número)
      if (productData.manage_stock) {
        cleanedData.stock_quantity = productData.stock_quantity || 0;
      }

      console.log("🧹 Datos limpiados para enviar:", cleanedData);
      console.log("🔍 Verificación de tipos para WooCommerce API:");
      console.log("- regular_price:", typeof cleanedData.regular_price, `"${cleanedData.regular_price}"`);
      console.log("- sale_price incluido:", 'sale_price' in cleanedData, cleanedData.sale_price ? `"${cleanedData.sale_price}"` : 'N/A');
      console.log("- weight incluido:", 'weight' in cleanedData, cleanedData.weight ? `"${cleanedData.weight}"` : 'N/A');
      console.log("- dimensions incluido:", 'dimensions' in cleanedData, cleanedData.dimensions);
      console.log("- stock_quantity incluido:", 'stock_quantity' in cleanedData, cleanedData.stock_quantity);

      const url = `${API_BASE_URL}/woocommerce/woo/${storeId}/product`;
      console.log("🌐 WooCommerceService: URL del endpoint:", url);

      // Obtener token de localStorage (intentar ambas opciones)
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
      }

      console.log("🔑 WooCommerceService: Token existe:", !!token);

      const response = await axiosInstance.post(
        url,
        cleanedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      )

      console.log("✅ WooCommerceService: Respuesta exitosa:", response.status);
      console.log("📦 WooCommerceService: Datos de respuesta:", response.data);

      return response.data
    } catch (error: any) {
      console.error("❌ WooCommerceService: Error completo:", error);
      
      // Si es un error de validación de nuestros datos
      if (error.message.includes('obligatorio') || error.message.includes('mayor a 0')) {
        throw error;
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Timeout: La petición tardó demasiado en responder (30 segundos)")
      }

      if (error.response) {
        const status = error.response.status
        const responseData = error.response.data
        
        console.error("❌ WooCommerceService: Status:", status);
        console.error("❌ WooCommerceService: Response data:", responseData);

        // Manejar diferentes tipos de errores del backend
        if (status === 422 && responseData?.errors) {
          // Errores de validación específicos
          const validationErrors = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Errores de validación del servidor:\n${validationErrors}`);
        }

        if (status === 400) {
          const message = responseData?.message || 'Datos incorrectos';
          throw new Error(`Error de datos: ${message}`);
        }

        if (status === 401) {
          throw new Error("No tienes autorización. Por favor, inicia sesión nuevamente.");
        }

        if (status === 404) {
          throw new Error(`Tienda ID ${storeId} no encontrada. Verifica que el mapeo de la tienda sea correcto.`);
        }

        if (status === 500) {
          const message = responseData?.message || 'Error interno del servidor';
          throw new Error(`Error del servidor: ${message}`);
        }

        // Error genérico con status
        const message = responseData?.message || error.message || 'Error desconocido';
        throw new Error(`Error ${status}: ${message}`);
      }

      if (error.request) {
        console.error("❌ WooCommerceService: Error de red - no response");
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
      }

      // Error genérico
      throw new Error(error.message || "Error desconocido al crear el producto en WooCommerce")
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

  async testConnectionWithId(testId: string | number): Promise<boolean> {
    try {
      console.log(`Probando conexión con ID: ${testId}`);

      const response = await axiosInstance.get(`${API_BASE_URL}/woocommerce/woo/${testId}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        timeout: 100000000, 
      });

      return response.status === 200 && response.data;
    } catch (error) {
      
      if (axios.isAxiosError(error)) {
        
        console.log(`ID ${testId} no funciona:`, error.response?.status || error.message);
      } else {
        
        console.log(`ID ${testId} no funciona debido a un error inesperado:`, error);
      }
      return false;
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

  async updateProduct({ storeId, productId, updatedData }: {
    storeId: number
    productId: number
    updatedData: any
  }): Promise<void> {
    await axiosInstance.put(`${API_BASE_URL}/woocommerce/woo/${storeId}/product/${productId}`, updatedData, {
      timeout: 30000,
    })
  }
}