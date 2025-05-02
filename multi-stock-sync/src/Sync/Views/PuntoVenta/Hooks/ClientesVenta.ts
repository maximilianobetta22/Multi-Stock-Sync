// src/sync/Views/PuntoVenta/Hooks/ClientesVenta.ts
import { useState, useEffect, useCallback } from 'react';

// Interfaz para un cliente según la API de 'clients-all'
export interface ClienteAPI { // <--- Añadimos 'export' aquí
id: number | string; // O string - Asegura que el ID puede ser string si la API lo devuelve así
tipo_clientes_id: number;
extranjero: number;
rut: string;
razon_social: string | null;
giro: string | null;
comuna: string | null;
direccion: string | null;
apellicos: string | null;
nombre: string | null;
region: string | null;
ciudad: string | null;
created_at: string;
updated_at: string;
}

export const useClientes = () => {
const [clientes, setClientes] = useState<ClienteAPI[]>([]);
const [cargandoClientes, setCargandoClientes] = useState<boolean>(false);
const [errorClientes, setErrorClientes] = useState<string | undefined>(undefined);

const cargarClientes = useCallback(async () => {
 setCargandoClientes(true);
 setErrorClientes(undefined);
 try {
 // URL del endpoint confirmada
 const url = 'http://127.0.0.1:8000/api/v1/clients-all';  // Verifica este puerto si es 3000 o 3001
 const response = await fetch(url); // O usa axios.get(url)

if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
 }

const data: ClienteAPI[] = await response.json();

 setClientes(data);

 } catch (err: any) {
 console.error("Error al cargar clientes:", err);
 setErrorClientes(err.message || 'Error al cargar clientes');
 setClientes([]);
 } finally {
 setCargandoClientes(false);
 }
}, []);


useEffect(() => {
cargarClientes();
}, [cargarClientes]);

return {
clientes,
cargandoClientes,
errorClientes,
recargarClientes: cargarClientes
};
};

export default useClientes; 