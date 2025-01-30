
export interface Producto {
  id: number;
  title: string;
  quantity: number;
  price: number;
  category_id: string;
  category: string;
}

export interface Venta {
  order_date: string;
  order_id: number;
  payment_method: string;
  products: Producto[];
  total_amount: number;
}

export interface Categoria{
  id: string;
  category: string;
  cantidadProductos: number;
  productos: Producto[];
  total: number;
}

export interface ProductoState {
  ventas: Venta[];
  categorias: Categoria[];
  totalCategoria: number[];
  productos: Producto[];
  productosFiltrados: Producto[];
  isLoading: boolean;
}