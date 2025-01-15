import { configureStore } from "@reduxjs/toolkit";
import { productosSlice } from "./Productos/productosSlice";

export const store = configureStore({
  reducer:{
    productos: productosSlice.reducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch