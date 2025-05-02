export type ClientType = 1 | 2;

   
export interface NaturalPerson {
    tipo_cliente_id: 2;
    nombres: string;
    apellidos: string;
    rut: string;
    extranjero: number;
    direccion: string;
    ciudad: string;
    comuna: string;
    region: string; 
  }
  
  export interface Company {
    tipo_cliente_id: 1;
    rut:string;
    nombres: string;
    apellidos: string;
    razon_social: string;
    giro:string;
    extrajero: number;
    direccion: string;
    ciudad: string;
    comuna: string;
    region: string; 
  }


export type ClientFormData = NaturalPerson | Company;


export interface client{
  apellidos: string;
  ciudad: string;
  comuna: string;
  created_at: string;
  direccion: string;
  extranjero: number;
  giro: string;
  id: number;
  nombres: string;
  razon_social: string;
  region: string;
  rut: string;
  tipo_cliente_id: number;
  updated_at: string;
}
export interface ClientesResponse {
  status: "success" | "error";
  data: client[];
  message?: string;
}




