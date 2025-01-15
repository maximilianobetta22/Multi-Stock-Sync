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
  allProductos: Producto[],
  isLoading: boolean
}

const initialState: ProductosState = {
  allProductos: [],
  isLoading: false
}

export const productosSlice = createSlice({
  name: 'productos',
  initialState,
  reducers:{
    addProductos: (state, action: PayloadAction<Producto>) => {
      state.allProductos.push(action.payload)
      state.isLoading = false
    },
    getAllProductos: (state, action: PayloadAction<Producto[]>) => {
      state.allProductos = action.payload
      state.isLoading = false
    },
    loadingProductos: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  }
})

export const {
  addProductos,
  getAllProductos,
  loadingProductos
} = productosSlice.actions