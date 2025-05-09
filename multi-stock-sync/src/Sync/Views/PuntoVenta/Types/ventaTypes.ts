
import { client } from './clienteTypes'
export interface VentaResponse {
  id: number; // O string
  warehouse_id: number; // O string
  client_id: number | null; // O string | null
  products: string; // O SalePayloadItem[] si backend ya lo parsea
  amount_total_products: number; // O string/null
  price_subtotal: number; // O string/null
  price_final: number; // O string/null
  // *** CORRECCIÓN CRÍTICA PARA EL ERROR DE TIPADO ***
  // Esto debe coincidir con los valores que el backend retorna y espera para type_emission
  type_emission: 'Boleta' | 'Factura' | null; // <-- DEBE SER ASÍ (MAYÚSCULAS)
  observation: string | null;
  name_companies: string | null; // Si el backend retorna este campo en la venta
  // Asegúrate que los valores de status_sale coinciden con los que el backend usa
  status_sale: 'Borrador' | 'Finalizado' | 'Emitido'; // <-- 'Finalizado' y 'Emitido' deben coincidir con backend
  created_at: string; // O Date
  updated_at: string; // O Date
  warehouse_name: string; // Si el backend incluye warehouse_name

  // Si tu backend retorna datos de cliente anidados en VentaResponse (menos ideal)
  // client?: {
  //     name: string;
  //     rut: string;
  //     razon_social: string;
  //     giro: string;
  // 
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



