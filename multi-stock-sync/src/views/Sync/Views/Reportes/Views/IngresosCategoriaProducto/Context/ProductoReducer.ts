import { Categoria, Producto, ProductoState, Venta } from "../Interfaces/interfaces"

type actionType = 
  | { type: 'getVentas', payload: Venta[] }
  | { type: 'updateProductos', payload: Producto[] } 
  | { type: 'updateCategorias', payload: Categoria[] } 
  | { type: 'updateTotalCategorias', payload: number[] } 
  | { type: 'loading', payload: boolean } 

export const ProductoReducer = (state: ProductoState, action: actionType):ProductoState => {

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
    case 'updateTotalCategorias':
      return{
        ...state,
        totalCategoria: action.payload
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