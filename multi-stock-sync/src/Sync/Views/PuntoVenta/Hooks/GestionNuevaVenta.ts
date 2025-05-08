// PuntoVenta/Hooks/GestionNuevaVenta.ts
import { useState, useCallback } from 'react';
import { SaleService } from '../Services/saleService'; // Importa el nuevo servicio
import { VentaResponse } from '../Types/ventaTypes'; // Importa VentaResponse para el tipo de retorno de la API

export interface ItemVenta {
  key: string;
  idProducto: string | number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface NotaVentaActual { // Esta interfaz describe la estructura interna de la venta que gestiona el hook (SIN warehouseId)
  idCliente: string | number | null;
  observaciones: string;
  items: ItemVenta[];
  // Eliminamos warehouseId de aquí
}

const useGestionNotaVentaActual = () => {
  const [notaVenta, setNotaVenta] = useState<NotaVentaActual>({
    idCliente: null,
    observaciones: '',
    items: [],
    // Eliminamos warehouseId de la inicialización
  });

  const subtotal = notaVenta.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal; // TODO: Considerar impuestos/descuentos si aplica

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
        key: Date.now().toString(), // Clave única para React
        idProducto: producto.id, // ID del producto para el backend
        nombre: producto.title,
        cantidad: 1,
        precioUnitario: numericPrice,
        total: numericPrice * 1,
      };
      setNotaVenta({ ...notaVenta, items: [...notaVenta.items, nuevoItem] });
    }
  }, [notaVenta]);

  const actualizarCantidadItem = useCallback((key: string, cantidad: number | null) => {
    // Permite cantidad 0 para poder eliminar un ítem poniendo cantidad a 0
    if (cantidad === null || cantidad < 0) return;

    // Si la cantidad es 0, eliminamos el item
    if (cantidad === 0) {
        eliminarItem(key); // Llama a la función eliminarItem
        return; // Salimos de la función
    }

    const nuevosItems = notaVenta.items.map(item =>
      item.key === key
        ? { ...item, cantidad: cantidad, total: cantidad * item.precioUnitario }
        : item
    );
    setNotaVenta({ ...notaVenta, items: nuevosItems });
  }, [notaVenta]); // Añadimos eliminarItem a las dependencias si lo usamos dentro

  const eliminarItem = useCallback((key: string) => {
    const nuevosItems = notaVenta.items.filter(item => item.key !== key);
    setNotaVenta({ ...notaVenta, items: nuevosItems });
  }, [notaVenta]);

  const establecerIdCliente = useCallback((idCliente: string | number | null | undefined) => {
    setNotaVenta(prevNotaVenta => ({ // Usar actualizador de estado para evitar problemas de dependencia
      ...prevNotaVenta,
      idCliente: idCliente === undefined ? null : idCliente
    }));
  }, []); // Dependencia vacía porque no usamos estado externo

  // Eliminamos establecerWarehouseId de aquí

  const establecerObservaciones = useCallback((observaciones: string) => {
    setNotaVenta(prevNotaVenta => ({ // Usar actualizador de estado
      ...prevNotaVenta,
      observaciones
    }));
  }, []); // Dependencia vacía

  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>(undefined);
  const [ventaGeneradaExitosa, setVentaGeneradaExitosa] = useState<VentaResponse | null>(null); // Estado para guardar la respuesta exitosa
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Estado para controlar la visibilidad del modal de éxito

  const clearGuardadoState = useCallback(() => {
      setCargandoGuardado(false);
      setErrorGuardado(undefined);
      setVentaGeneradaExitosa(null);
      setShowSuccessModal(false);
  }, []);

  // Modificamos guardarBorrador para aceptar warehouseId como parámetro
  const guardarBorrador = async (warehouseId: string | number | null) => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);
    setVentaGeneradaExitosa(null);

    console.log("Guardando borrador:", { ...notaVenta, warehouseId }); // Incluimos warehouseId en el log

    // Validación básica
    if (!notaVenta.idCliente) {
      setErrorGuardado('Debes seleccionar un cliente para guardar el borrador.');
      setCargandoGuardado(false);
      throw new Error('Cliente no seleccionado.');
    }
    if (!warehouseId) { // Validamos el warehouseId recibido como parámetro
      setErrorGuardado('Debes seleccionar una bodega para guardar el borrador.');
      setCargandoGuardado(false);
      throw new Error('Bodega no seleccionada.');
    }
    if (notaVenta.items.length === 0) {
      setErrorGuardado('El borrador debe contener al menos un producto.');
      setCargandoGuardado(false);
      throw new Error('No hay productos en la venta.');
    }


    try {
      // Pasar saleData y warehouseId al servicio
      const response = await SaleService.createSale(notaVenta, 'borrador', warehouseId); // Pasamos warehouseId aquí
      console.log("Borrador guardado exitosamente:", response);
       // Opcional: Mostrar un mensaje de éxito temporal
    } catch (error: any) {
      console.error("Error al guardar borrador:", error);
      setErrorGuardado(error.message || "Error al guardar borrador.");
      throw error; // Re-lanzar el error
    } finally {
      setCargandoGuardado(false);
    }
  };

  // Modificamos generarNotaVentaFinal para aceptar warehouseId como parámetro
  const generarNotaVentaFinal = async (warehouseId: string | number | null): Promise<VentaResponse> => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);
    setVentaGeneradaExitosa(null);

    console.log("Generando nota de venta final:", { ...notaVenta, warehouseId }); // Incluimos warehouseId en el log

     // Validación básica antes de enviar
     if (!notaVenta.idCliente) {
         setErrorGuardado('Debes seleccionar un cliente para generar la nota de venta.');
         setCargandoGuardado(false);
         throw new Error('Cliente no seleccionado.'); // Lanzar error para detener el flujo
     }
      if (notaVenta.items.length === 0) {
         setErrorGuardado('La nota de venta debe contener al menos un producto.');
         setCargandoGuardado(false);
         throw new Error('No hay productos en la venta.'); // Lanzar error
     }
      // Validamos el warehouseId recibido como parámetro
      if (!warehouseId) {
         setErrorGuardado('Debes seleccionar una bodega para generar la nota de venta.');
         setCargandoGuardado(false);
         throw new Error('Bodega no seleccionada.'); // Lanzar error
     }


    try {
      // Llamar al servicio para crear la venta con estado 'Finalizado'
      const response = await SaleService.createSale(notaVenta, 'Finalizado', warehouseId); // Pasamos warehouseId aquí
      console.log("Nota de venta final generada exitosamente:", response);

      setVentaGeneradaExitosa(response); // Guarda la respuesta exitosa
      setShowSuccessModal(true); // Muestra el modal de éxito
      // No limpiarNotaVenta aquí automáticamente para que el usuario pueda ver el modal.
      // La vista llamará a clearGuardadoState y potencialmente a limpiarNotaVenta al cerrar el modal.
      return response; // Devuelve la respuesta exitosa

    } catch (error: any) {
      console.error("Error al generar nota de venta final:", error);
      setErrorGuardado(error.message || "Error al generar nota de venta final.");
      // No limpiarNotaVenta aquí para permitir al usuario corregir y reintentar
      throw error; // Re-lanzar el error para que el componente que llama lo maneje si es necesario
    } finally {
      setCargandoGuardado(false);
    }
  };

  const limpiarNotaVenta = useCallback(() => {
    setNotaVenta({
      idCliente: null,
      observaciones: '',
      items: [],
      // Eliminamos warehouseId de la limpieza
    });
    // clearGuardadoState(); // La limpieza de estados de guardado se hace al cerrar el modal
  }, []); // Dependencia vacía


  return {
    notaVenta,
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    ventaGeneradaExitosa, // Exporta el estado de éxito
    showSuccessModal, // Exporta el estado del modal
    clearGuardadoState, // Exporta la función para limpiar estados de guardado

    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente,
    // Eliminamos establecerWarehouseId de la exportación
    establecerObservaciones,
    guardarBorrador, // Ahora acepta warehouseId como parámetro
    generarNotaVentaFinal, // Ahora acepta warehouseId como parámetro
    limpiarNotaVenta,
  };
};

export default useGestionNotaVentaActual;