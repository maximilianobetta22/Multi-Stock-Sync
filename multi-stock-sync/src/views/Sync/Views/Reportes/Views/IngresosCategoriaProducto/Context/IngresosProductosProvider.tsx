import { useReducer } from "react";
import { Producto, ProductoState, Venta } from "../Interfaces/interfaces";
import { IngresosProductosContext } from "./IngresosProductosContext";
import { ProductoReducer } from "./ProductoReducer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { groupByIdProduct } from "../helpers/groupByIdProduct";
import { groupByCategory } from "../helpers/groupByCategory";

const INITIAL_STATE: ProductoState = { 
  ventas: [],
  categorias: [],
  totalCategoria: [],
  productos: [],
  productosFiltrados: [],
  isLoading: false,
}

interface Props {
  children: React.ReactNode;
}

export const IngresosProductosProvider = ({ children }: Props) => {

  const { client_id } = useParams()
  const [ ProductoState, dispatch ] = useReducer(ProductoReducer, INITIAL_STATE);

  const getVentas = ( start_date:string, end_date:string ) => {
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
      dispatch({ 
        type: 'loading', 
        payload: true 
      })
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
        type: 'updateProductos',
        payload: groupByIdProduct(allProductos)
      })
      dispatch({
        type: 'updateCategorias',
        payload: groupByCategory(allProductos)
      })
      }).catch((err) => {
        console.log(err);
      })
  };

  return (
    <IngresosProductosContext.Provider value={{
      ProductoState,
      getVentas
    }}>
      {children}
    </IngresosProductosContext.Provider>
  );
};