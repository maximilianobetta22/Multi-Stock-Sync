


cantidad: 1
​​​
date_created: "2025-04-29T20:52:57.000-04:00"
​​​
fecha_envio_programada: "2025-04-30 00:00:00"
​​​
id_producto: "MLC1524411255"
​​​
nombre_producto: "Pantaleta Cotton Spandex Ac-183"
​​​
order_id: 2000011460392686
​​​
receptor: Object { id_receiver: 336917268, name_receiver: "ROSE6248537", direction: "Pasaje Monte de Los Olivos Bosques de Santa Clara 2179, Ingresar por calle Roser Bru hacia abajo, Villa Galilea, Rancagua, Libertador B. O'Higgins" }
​​​
shipment_status: null
​​​
shipping_id: 44798182629
​​​
sku: "AC-183-MO-14/16"
​​​
substatus: null
​​​
"tamaño": "Morado / 14/16"







export interface Envio {
  order_id: string;
  shipping_id: string;
  id_producto:string;
  fecha_envio_programada: string;
  nombre_producto: string;
  cantidad: number;
  tamaño: string;
  sku: string;
  shipment_status: string;
  receptor:receptor;
}

export interface EnviosResponse {
  status: "success" | "error";
  data: Envio[];
  message?: string;
}
  

//envio en transito
export interface receptor{
  receiver_id: string;
  receiver_name: string;
  dirrection: string;
}


export interface EnviosTransitoResponse {
  status: "success" | "error";
  data: Enviostransito[];
  message?: string;
}
  
export interface Enviostransito {
  shipping_id: string;
  productId: string;
  order_id: string;
  title: string;
  quantity: number;
  size: string;
  shipment_history: ShipmentTransitoHistory;
  receptor: receptor; // receptor
  date_shipment: string;
  tracking_number: string;
  substatus:string;
}


export interface ShipmentTransitoHistory {
  substatus: string;
  date_created?: string;
}

