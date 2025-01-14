import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Producto {
  img: string,
  nombre: string
  sku: string
  precio: number
  precioMayor: number
  cantidad: number
}

interface ProductosState {
  allProductos: Producto[]
}

const initialState: ProductosState = {
  allProductos: []
}

export const productosSlice = createSlice({
  name: 'productos',
  initialState,
  reducers:{
    addProducto: (state, action: PayloadAction<Producto>) => {
      state.allProductos.push(action.payload)
    }
  }
})

export const {
  addProducto
} = productosSlice.actions