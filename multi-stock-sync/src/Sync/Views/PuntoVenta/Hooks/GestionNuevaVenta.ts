import { useState, useCallback } from 'react';
import axios from 'axios'; 
// Definimos la estructura de un ítem de venta en el frontend
export interface ItemVenta {
  key: string; // Clave local para React
  idProducto: string | number; // ID del producto
  nombre: string; // Nombre del producto
  cantidad: number; // Cantidad
  precioUnitario: number; // Precio por unidad
  total: number; // Precio total de la línea
}

// Estructura del estado de la nota de venta en el hook
interface NotaVentaActual {
  id: number | null; // ID del backend
  idCliente: string | number | null; // ID del cliente
  observaciones: string; // Texto de observaciones
  items: ItemVenta[]; // Lista de ítems
}

// Estructura de un ítem para el payload del backend
interface BackendSaleItem {
    product_id: string | number;
    quantity: number;
    unit_price: number;
}

// Estructura del payload completo para el backend
interface BackendSalePayload {
    warehouse_id: string | number;
    client_id: string | number | null;
    products: BackendSaleItem[]; // <-- CORREGIDO: La clave ahora es 'products'
    amount_total_products: number;
    price_subtotal: number;
    price_final: number;
    type_emission: string;
    observation: string | null;
    name_companies?: string;
}


// URL base de tu API.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


// --- Función auxiliar para obtener el token de autenticación ---
// Usa la clave 'token' para obtenerlo de localStorage (verificado que funciona)
const getAuthToken = (): string | null => {
    const token = localStorage.getItem('token'); // <-- Usando la clave 'token'
    console.log("Token obtenido por getAuthToken:", token); // Para verificar
    return token;
};
// --- Fin función auxiliar ---


// Definimos el hook
const useGestionNotaVentaActual = () => {
  // Estado de la nota de venta
  const [notaVenta, setNotaVenta] = useState<NotaVentaActual>({
    id: null,
    idCliente: null,
    observaciones: '',
    items: [],
  });

  // Cálculos de totales
  const subtotal = notaVenta.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  // Funciones para modificar ítems
  const agregarItem = useCallback((producto: { id: string | number; title: string; price: number | string | undefined | null }) => {
    const numericPrice = parseFloat(String(producto.price)) || 0;
    const itemExistente = notaVenta.items.find(item => item.idProducto === producto.id);
    if (itemExistente) {
      const nuevosItems = notaVenta.items.map(item =>
        item.idProducto === producto.id
          ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.precioUnitario }
          : item
      );
      setNotaVenta({ ...notaVenta, items: nuevosItems });
    } else {
      const nuevoItem: ItemVenta = {
        key: Date.now().toString(),
        idProducto: producto.id,
        nombre: producto.title,
        cantidad: 1,
        precioUnitario: numericPrice,
        total: numericPrice,
      };
      setNotaVenta({ ...notaVenta, items: [...notaVenta.items, nuevoItem] });
    }
  }, [notaVenta]);

  const actualizarCantidadItem = useCallback((key: string, cantidad: number | null) => {
    if (cantidad === null || cantidad <= 0) return;
    const nuevosItems = notaVenta.items.map(item =>
      item.key === key
        ? { ...item, cantidad: cantidad, total: cantidad * item.precioUnitario }
        : item
    );
    setNotaVenta({ ...notaVenta, items: nuevosItems });
  }, [notaVenta]);

  const eliminarItem = useCallback((key: string) => {
    const nuevosItems = notaVenta.items.filter(item => item.key !== key);
    setNotaVenta({ ...notaVenta, items: nuevosItems });
  }, [notaVenta]);

  // Funciones para establecer cliente y observaciones
  const establecerIdCliente = useCallback((idCliente: string | number | null | undefined) => {
    setNotaVenta({ ...notaVenta, idCliente: idCliente === undefined ? null : idCliente });
  }, [notaVenta]);

  const establecerObservaciones = useCallback((observaciones: string) => {
    setNotaVenta({ ...notaVenta, observaciones });
  }, [notaVenta]);


  // Estados de carga y error para guardado/generación
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>(undefined);

  // Función auxiliar para preparar el payload
  const prepararPayloadVenta = (warehouseId: string | number | null, typeEmission: string, nameCompanies: string | null): BackendSalePayload | null => {
      if (!warehouseId) { setErrorGuardado("Falta seleccionar la bodega."); return null; }
      if (notaVenta.items.length === 0) { setErrorGuardado("La venta no tiene productos."); return null; }
      if (typeEmission === 'factura') {
           if (notaVenta.idCliente === null) { setErrorGuardado("Para Factura, debes seleccionar un cliente."); return null; }
           if (!nameCompanies) { setErrorGuardado("Para Factura, debes especificar el nombre de la empresa."); return null; }
      }

      const backendItems: BackendSaleItem[] = notaVenta.items.map(item => ({
          product_id: item.idProducto,
          quantity: item.cantidad,
          unit_price: item.precioUnitario,
      }));

      const amountTotalProducts = notaVenta.items.reduce((sum, item) => sum + item.cantidad, 0);

      // --- CORREGIDO: Usamos la clave 'products' para el array de ítems ---
      const payload: BackendSalePayload = {
          warehouse_id: warehouseId,
          client_id: notaVenta.idCliente,
          products: backendItems, // <-- La clave es 'products'
          amount_total_products: amountTotalProducts,
          price_subtotal: subtotal,
          price_final: total,
          type_emission: typeEmission,
          observation: notaVenta.observaciones || null,
          ...(typeEmission === 'factura' && { name_companies: nameCompanies || undefined }),
      };
      // --- Fin CORRECCIÓN ---

      console.log("Payload a enviar:", payload);
      return payload;
  };


  // --- Función para guardar BORRADOR ---
  const guardarBorrador = async (warehouseId: string | number | null, typeEmission: string, nameCompanies: string | null): Promise<boolean> => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);

    const payload = prepararPayloadVenta(warehouseId, typeEmission, nameCompanies);
    if (!payload) {
        setCargandoGuardado(false);
        return false;
    }

    // --- Obtener el token y configurar cabeceras ---
    const token = getAuthToken();
    if (!token) {
        setErrorGuardado("Error: No autenticado. Por favor, inicie sesión.");
        setCargandoGuardado(false);
        return false;
    }
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
    // --- Fin configuración de cabeceras ---

    try {
        // Petición POST a /borrador
        const response = await axios.post(`${API_BASE_URL}/generated-sale-note/Pendiente`, payload, config);

        if (response.status === 201) {
            const ventaGuardada = response.data.data;
            if (ventaGuardada && ventaGuardada.id) {
                 setNotaVenta(prev => ({ ...prev, id: ventaGuardada.id }));
                 console.log("Borrador guardado exitosamente. ID:", ventaGuardada.id);
                 return true;
            } else {
                 console.error("Error al guardar borrador: Respuesta exitosa pero sin ID esperado.", response.data);
                 setErrorGuardado("Error al guardar borrador: Respuesta inesperada del servidor.");
                 return false;
            }
        } else {
             console.error("Error al guardar borrador: Código de estado inesperado:", response.status, response.data);
             setErrorGuardado(`Error al guardar borrador: ${response.statusText || response.status} - ${response.data?.message || 'Error desconocido'}`);
             return false;
         }
    } catch (error: any) {
        console.error("Error al guardar borrador:", error.response?.data || error.message || error);
         const errorMessage = error.response?.data?.message || error.message || "Error de conexión al guardar borrador.";
        setErrorGuardado(errorMessage);
        return false;
    } finally {
       setCargandoGuardado(false);
    }
   };

  // --- Función para generar NOTA FINAL ---
    const generarNotaVentaFinal = async (warehouseId: string | number | null, typeEmission: string, nameCompanies: string | null): Promise<boolean> => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);

     const payload = prepararPayloadVenta(warehouseId, typeEmission, nameCompanies);
     if (!payload) {
         setCargandoGuardado(false);
         return false;
     }

     // --- Obtener el token y configurar cabeceras ---
     const token = getAuthToken();
     if (!token) {
         setErrorGuardado("Error: No autenticado. Por favor, inicie sesión.");
         setCargandoGuardado(false);
         return false;
     }
     const config = {
         headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json',
         }
     };
     // --- Fin configuración de cabeceras ---

     try {
        // Petición POST a /finalizado
         const response = await axios.post(`${API_BASE_URL}/generated-sale-note/Finalizado`, payload, config);

         if (response.status === 201) {
            const ventaFinalizada = response.data.data;
            if (ventaFinalizada && ventaFinalizada.id) {
                 setNotaVenta(prev => ({ ...prev, id: ventaFinalizada.id }));
                 console.log("Nota de venta final generada exitosamente. ID:", ventaFinalizada.id);
                 limpiarNotaVenta(); // Limpia el estado local al finalizar exitosamente
                 return true;
            } else {
                 console.error("Error al generar nota de venta final: Respuesta exitosa pero sin ID esperado.", response.data);
                 setErrorGuardado("Error al generar nota de venta final: Respuesta inesperada del servidor.");
                 return false;
            }
         } else {
             console.error("Error al generar nota de venta final: Código de estado inesperado:", response.status, response.data);
             setErrorGuardado(`Error al generar nota de venta final: ${response.statusText || response.status} - ${response.data?.message || 'Error desconocido'}`);
             return false;
         }
     } catch (error: any) {
        console.error("Error al generar nota de venta final:", error.response?.data || error.message || error);
         const errorMessage = error.response?.data?.message || error.message || "Error de conexión al generar nota de venta final.";
        setErrorGuardado(errorMessage);
        return false;
     } finally {
        setCargandoGuardado(false);
     }
   };

   // Función para limpiar el estado local
   const limpiarNotaVenta = useCallback(() => {
    setNotaVenta({
       id: null,
       idCliente: null,
       observaciones: '',
       items: [],
    });
   }, []);


  // Lo que el hook devuelve
  return {
     notaVenta,
     subtotal,
     total,
     cargandoGuardado,
     errorGuardado,
     agregarItem,
     actualizarCantidadItem,
     eliminarItem,
     establecerIdCliente,
     establecerObservaciones,
     guardarBorrador,
     generarNotaVentaFinal,
     limpiarNotaVenta,
   };
};

export default useGestionNotaVentaActual;