
export interface VentaResponse {
    id: number;
    warehouse_id: number;
    type_emission: string;
    amount_total_products: number;
    price_subtotal: number;
    price_final: number;
    client_id: number;
    products: string;
    name_companies: string;
    observation: string;
    shipping: string;
    created_at: Date;
    status_sale: string;
  }

export interface EstadoReceive{
    data:VentaResponse;
    message: string;
}
export interface products {
  nombre?: string;
  cantidad?: number;
  unitPrice?:number;
}
export interface setVenta{
  type_emission:string;
  warehouse_id:number;
  client_id:number;
  products:products;
  amount_total_products:number;
  price_subtotal:number;
  price_final:number;
}

export interface FiltrosBackend {
  client_id?: number;
  date_start?: string;
  status_sale?: string;
  all_sale?: number;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: number | string | null | [] | VentaResponse[];
}

export interface ItemVenta {
  key: string;
  idProducto: string | number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface NotaVentaActual {
  idCliente: string | number | null ;
  observaciones: string;
  items: ItemVenta[];
  warehouseId: string | number |null;
  saleId?: string | number;
}

