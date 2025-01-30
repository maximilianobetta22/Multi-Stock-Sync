import { createContext } from "react";
import { ProductoState } from "../Interfaces/interfaces";

export type ProductoContextProps = {
  ProductoState: ProductoState;
  getVentas: (start_date: string, end_date: string) => void;
}

export const IngresosProductosContext = createContext<ProductoContextProps>({} as ProductoContextProps);