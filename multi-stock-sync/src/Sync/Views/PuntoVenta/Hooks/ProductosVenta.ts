import { useState, useEffect } from 'react'; // Eliminamos useCallback si estaba importado

// Interfaz para un producto según la API de 'products-by-company'
export interface ProductoAPI { // <--- Añadimos 'export' aquí
id: number | string; // O string
title: string; // Parece ser el nombre del producto
order: number; // Algún tipo de orden, no relevante para la venta
available_quantity: number; // Cantidad disponible
warehouse_name: string; // Nombre de la bodega
company_name: string; // Nombre de la empresa
client_id: number | string; // ID del cliente (raro en un producto, quizás para filtrar? - Asegura tipo compatible)
price: number; // Mantenemos esto, pero CONFIRMA con backend si existe y es number
}

export const useProductosPorEmpresa = (idEmpresa?: string | number | null) => {
const [productos, setProductos] = useState<ProductoAPI[]>([]);
const [cargandoProductos, setCargandoProductos] = useState<boolean>(false);
const [errorProductos, setErrorProductos] = useState<string | undefined>(undefined);

// Usamos useEffect para cargar productos cuando cambie el idEmpresa
useEffect(() => {
// Solo cargar si idEmpresa está definido y no es nulo
if (idEmpresa !== undefined && idEmpresa !== null) {
const cargarProductos = async () => {
setCargandoProductos(true);
setErrorProductos(undefined);
try {
// URL del endpoint, usando el id de la empresa
const url = `http://127.0.0.1:8000/api/v1/products-by-company/${idEmpresa}`; 
const response = await fetch(url); // O usa axios.get(url)

if (!response.ok) {
const errorData = await response.json();
 throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
}

const data: { message: string, data: ProductoAPI[] } = await response.json();

if (!data.data || !Array.isArray(data.data)) {
throw new Error("Formato de respuesta de productos inesperado.");
}

setProductos(data.data);

} catch (err: any) {
console.error(`Error al cargar productos para empresa ${idEmpresa}:`, err);
setErrorProductos(err.message || `Error al cargar productos para empresa ${idEmpresa}`);
setProductos([]);
} finally {
setCargandoProductos(false);
}
};

cargarProductos();
} else {
setProductos([]);
setErrorProductos(undefined);
}

}, [idEmpresa]);

return {
productos,
cargandoProductos,
errorProductos,
};
};

export default useProductosPorEmpresa; // <--- Añadimos export default aquí