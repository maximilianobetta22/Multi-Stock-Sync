import { createContext, Dispatch } from "react";
import { IngresosProductoState } from "../Interfaces/interfaces";
import { actionType } from "./ProductoReducer";

export type ProductoContextProps = {
  ProductoState: IngresosProductoState;
  getVentas: (start_date: string, end_date: string) => void;
  dispatch: Dispatch<actionType>;
}

export const IngresosProductosContext = createContext<ProductoContextProps>({} as ProductoContextProps);