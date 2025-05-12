import { client } from './clienteTypes'
export interface VentaResponse {
  id: number;
  warehouse_id: number;
  client_id: number | null;
  products: string;
  amount_total_products: number;
  price_subtotal: number;
  price_final: number;
  type_emission: 'Boleta' | 'Factura' | null;
  observation: string | null;
  name_companies: string | null;
  status_sale: 'Borrador' | 'Finalizado' | 'Emitido';
  created_at: string;
  updated_at: string;
  warehouse_name: string;
  }
export interface VentaCliente{
    cliente:client;
    venta:VentaResponse;

}
export interface EstadoReceive{
    data:VentaResponse;
    message: string;
}
export interface products{
  quantity:number;
  unit_price:number;
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