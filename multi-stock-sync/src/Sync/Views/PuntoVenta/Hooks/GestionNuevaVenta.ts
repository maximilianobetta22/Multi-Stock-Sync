import { useState, useCallback } from 'react';


export interface ItemVenta {
  key: string;
  idProducto: string | number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface NotaVentaActual {
  idCliente: string | number | null;
  observaciones: string;
  items: ItemVenta[];
}

const useGestionNotaVentaActual = () => {
  const [notaVenta, setNotaVenta] = useState<NotaVentaActual>({
    idCliente: null,
    observaciones: '',
    items: [],
  });

  const subtotal = notaVenta.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

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
        total: numericPrice * 1,
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

  const establecerIdCliente = useCallback((idCliente: string | number | null | undefined) => {
    setNotaVenta({ ...notaVenta, idCliente: idCliente === undefined ? null : idCliente });
  }, [notaVenta]);

  const establecerObservaciones = useCallback((observaciones: string) => {
    setNotaVenta({ ...notaVenta, observaciones });
  }, [notaVenta]);

  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>(undefined);

  const guardarBorrador = async () => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);
    console.log("Guardando borrador:", notaVenta);

    try {
      // TODO: Implementar lógica de guardado real en el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Borrador guardado exitosamente (simulado).");
    } catch (error: any) {
      console.error("Error al guardar borrador (simulado):", error);
      setErrorGuardado("Error al guardar borrador (simulado).");
    } finally {
      setCargandoGuardado(false);
    }
  };

  const generarNotaVentaFinal = async () => {
    setCargandoGuardado(true);
    setErrorGuardado(undefined);
    console.log("Generando nota de venta final:", notaVenta);

    try {
      // TODO: Implementar lógica de generación final en el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Nota de venta final generada exitosamente (simulado).");
      limpiarNotaVenta();
    } catch (error: any) {
      console.error("Error al generar nota de venta final (simulado):", error);
      setErrorGuardado("Error al generar nota de venta final (simulado).");
    } finally {
      setCargandoGuardado(false);
    }
  };

  const limpiarNotaVenta = useCallback(() => {
    setNotaVenta({
      idCliente: null,
      observaciones: '',
      items: [],
    });
  }, []);

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