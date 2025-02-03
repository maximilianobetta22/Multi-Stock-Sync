import { useReducer } from "react";
import { Producto, IngresosProductoState, Venta } from "../Interfaces/interfaces";
import { IngresosProductosContext } from "./IngresosProductosContext";
import { ProductoReducer } from "./ProductoReducer";
import { useParams } from "react-router-dom";
import { groupByIdProduct, groupByCategory, handleFilterCategory, groupByPaymentMethod} from "../helpers";
import axios from "axios";

const INITIAL_STATE: IngresosProductoState = { 
  ventas: [],
  categorias: [],
  productos: [],
  categoriasFiltradas: [],
  categoriaActiva: 'Todo',
  metodosPago: [],
  totalFinal: 0,
  isLoading: false,
}

interface Props {
  children: React.ReactNode;
}

export const IngresosProductosProvider = ({ children }: Props) => {

  const { client_id } = useParams()
  const [ ProductoState, dispatch ] = useReducer(ProductoReducer, INITIAL_STATE);

  const getVentas = ( start_date:string, end_date:string ) => {

    dispatch({ 
      type: 'loading', 
      payload: true 
    })

    axios({
      url:`${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-date-range/${client_id}?`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      params:{
        start_date: start_date,
        end_date: end_date,
      },
      timeout: 10000,
    }).then((resp) => {
      const ventas: Venta[] = []
      const allProductos: Producto[] = []
      
      Object.entries(resp.data.data).map((venta) => {
        (venta[1] as Venta[]).map((v:Venta) => {
          ventas.push(v)
          v.products.map((p:Producto) => {
            allProductos.push(p)
          })
        }) 
      })
      dispatch({
        type: 'getVentas',
        payload: ventas
      })
      dispatch({
        type: 'updatePaymentMethods',
        payload: groupByPaymentMethod(ventas)
      })
      dispatch({
        type: 'updateProductos',
        payload: groupByIdProduct(allProductos)
      })
      dispatch({
        type: 'updateCategorias',
        payload: groupByCategory(allProductos)
      })
      dispatch({
        type: 'updateTotalFinal',
        payload: allProductos.reduce((acumulador, prod) => acumulador + (prod.price * prod.quantity), 0)
      })
      handleFilterCategory('Todo', dispatch, groupByCategory(allProductos))
      dispatch({ 
        type: 'loading', 
        payload: false
      })
      }).catch((err) => {
        console.log(err);
        dispatch({ 
          type: 'loading', 
          payload: false
        })
      })
  };

  return (
    <IngresosProductosContext.Provider value={{
      ProductoState,
      getVentas,
      dispatch,
    }}>
      {children}
    </IngresosProductosContext.Provider>
  );
};