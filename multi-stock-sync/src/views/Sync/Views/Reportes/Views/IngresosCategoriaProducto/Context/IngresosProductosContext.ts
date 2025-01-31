import { createContext, Dispatch } from "react";
import { ProductoState } from "../Interfaces/interfaces";
import { actionType } from "./ProductoReducer";

export type ProductoContextProps = {
  ProductoState: ProductoState;
  getVentas: (start_date: string, end_date: string) => void;
  dispatch: Dispatch<actionType>;
}

export const IngresosProductosContext = createContext<ProductoContextProps>({} as ProductoContextProps);