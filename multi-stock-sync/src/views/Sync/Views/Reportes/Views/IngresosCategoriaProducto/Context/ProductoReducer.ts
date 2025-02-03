import { Categoria, Producto, IngresosProductoState, Venta, PaymentMethod } from "../Interfaces/interfaces"

export type actionType = 
  | { type: 'getVentas', payload: Venta[] }
  | { type: 'updateProductos', payload: Producto[] } 
  | { type: 'updateCategorias', payload: Categoria[] } 
  | { type: 'updateTotalFinal', payload: number } 
  | { type: 'updateCategoriasFiltradas', payload: Categoria[] } 
  | { type: 'updateCategoriaActiva', payload: string } 
  | { type: 'updatePaymentMethods', payload: PaymentMethod[]} 
  | { type: 'loading', payload: boolean } 

export const ProductoReducer = (state: IngresosProductoState, action: actionType):IngresosProductoState => {

  switch (action.type) {
    case 'getVentas':
      return {
        ...state,
        ventas: action.payload
      }
    case 'updateProductos':
      return{
        ...state,
        productos: action.payload
      }
    case 'updateCategorias':
      return{
        ...state,
        categorias: action.payload
      }
    case 'updateTotalFinal':
      return{
        ...state,
        totalFinal: action.payload
      }
    case 'updateCategoriasFiltradas':
      return{
        ...state,
        categoriasFiltradas: action.payload
      }
    case 'updateCategoriaActiva':
      return{
        ...state,
        categoriaActiva: action.payload
      }
    case 'updatePaymentMethods': 
      return{
        ...state,
        metodosPago: action.payload
      }
    case 'loading':
      return{
        ...state,
        isLoading: action.payload
      }
    default:
      return state
  }
}