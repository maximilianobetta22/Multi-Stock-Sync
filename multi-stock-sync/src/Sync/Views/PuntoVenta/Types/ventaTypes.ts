
import { client } from './clienteTypes'
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
export interface VentaCliente{
    cliente:client;
    venta:VentaResponse;

}
/*id int(11) PK 
warehouse_id bigint(20) UN 
products  
amount_total_products int(11) 
price_subtotal int(11) 
price_final int(11) 
client_id bigint(20) fk?
type_emission varchar(20) 
name_companies varchar(50) 
observation varchar(255) 
shipping longtext 
created_at timestamp 
status_sale varchar(10)*/


/*table product_sale
id bigint(20) PK 
warehouse_id bigint(20) */
