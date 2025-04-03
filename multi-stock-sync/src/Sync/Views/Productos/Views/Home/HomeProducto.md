# 🛒 HomeProducto Component

## Descripción

El componente `HomeProducto` es el encargado de gestionar y mostrar productos. Permite a los usuarios buscar, filtrar y actualizar productos obtenidos desde MercadoLibre.

## 📌 Características

✔️ Obtención de productos desde una API externa.  
✔️ Búsqueda y filtrado de productos por categoría y nombre.  
✔️ Gestión del stock y estado de los productos.  
✔️ Paginación y modal de acciones detalladas.  
✔️ Manejo de notificaciones tipo *toast*.  

## 📂 Hooks Utilizados

- **useState**: Para manejar estados locales.  
- **useEffect**: Para efectos secundarios, como la obtención de datos.  
- **useNavigate**: Para la navegación entre páginas.  

## 🛠️ Tipos de Datos

### **Connection**
```ts
interface Connection {
  client_id: string;
  access_token: string;
}
```
### **Product**
```ts
interface Product {
  id: string;
  title: string;
  price: number;
  category_id: string;
}
```

## 🌟 Estados Principales

| Estado                 | Tipo                                     | Descripción |
|------------------------|-----------------------------------------|-------------|
| `connections`         | `Connection[]`                          | Lista de conexiones disponibles. |
| `selectedConnection`  | `string`                                | Conexión seleccionada. |
| `loading`            | `boolean`                               | Estado de carga de productos. |
| `allProductos`       | `Product[]`                             | Lista de productos obtenidos. |
| `loadingConnections` | `boolean`                               | Estado de carga de conexiones. |
| `toastMessage`       | `string \| null`                        | Mensaje de la notificación. |
| `toastType`         | `'success' \| 'warning' \| 'error'`     | Tipo de notificación. |
| `stockEdit`        | `{ [key: string]: number }`             | Mapeo de IDs de productos a stock editado. |
| `isUpdating`      | `boolean`                               | Estado de actualización en progreso. |
| `modalIsOpen`    | `boolean`                               | Estado del modal de acciones. |
| `isEditing`      | `{ [key: string]: boolean }`            | Mapeo de IDs de productos a estado de edición. |
| `currentProduct` | `Product \| null`                       | Producto seleccionado para acciones detalladas. |
| `modalContent`   | `'main' \| 'stock' \| 'pause'`         | Tipo de contenido a mostrar en el modal. |
| `searchQuery`    | `string`                               | Consulta de búsqueda actual. |
| `selectedCategory` | `string`                              | Categoría seleccionada. |
| `limit`          | `number`                               | Límite de productos por página. |
| `offset`         | `number`                               | Desplazamiento para paginación. |
| `totalProducts`  | `number`                               | Total de productos disponibles. |
| `categories`     | `{ [key: string]: string }`           | Mapeo de IDs de categorías a nombres. |
| `selectedProduct` | `Product \| null`                     | Producto actualmente seleccionado. |

## 🛠️ Métodos Principales

| Método                   | Descripción |
|--------------------------|-------------|
| `fetchConnections()`    | Obtiene conexiones desde la API. |
| `fetchProducts()`       | Obtiene productos según conexión y filtros. |
| `fetchCategories()`     | Obtiene nombres de categorías. |
| `handleConnectionChange()` | Cambia la conexión seleccionada. |
| `handleSearch()`        | Maneja la búsqueda de productos. |
| `handleCategoryChange()` | Filtra productos por categoría. |
| `handlePageChange()`    | Cambia la página actual. |
| `handleStockChange()`   | Modifica el stock de un producto. |
| `updateStock()`         | Actualiza el stock en la API. |
| `updateStatus()`        | Cambia el estado de un producto. |
| `openModal()`          | Abre el modal de acciones. |
| `closeModal()`         | Cierra el modal. |
| `formatPriceCLP()`     | Formatea el precio a CLP. |
| `translateStatus()`    | Traduce el estado del producto. |
| `categorizeProducts()` | Categoriza productos. |
| `filterResults()`      | Filtra productos por criterios específicos. |
| `onSelectSuggestion()` | Maneja la selección de sugerencias de búsqueda. |

---

📌 *Este componente forma parte de un sistema de gestión de productos en MercadoLibre.*
