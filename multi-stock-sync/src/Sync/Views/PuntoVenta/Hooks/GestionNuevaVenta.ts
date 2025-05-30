import { useState, useCallback } from "react"
import { SaleService } from "../Services/saleService"
import type { VentaResponse } from "../Types/ventaTypes"

export interface ItemVenta {
  key: string
  idProducto: string | number
  nombre: string
  cantidad: number
  precioUnitario: number
  total: number
}

export interface NotaVentaActual {
  idCliente: string | number | null
  observaciones: string
  items: ItemVenta[]
  warehouseId?: string | number | null // Solo para compatibilidad con el modal
  saleId?: string | number // Solo para compatibilidad con el modal
}

const useGestionNotaVentaActual = () => {
  const [notaVenta, setNotaVenta] = useState<NotaVentaActual>({
    idCliente: null,
    observaciones: "",
    items: [],
  })

  const subtotal = notaVenta.items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal

  const agregarItem = useCallback(
    (producto: {
      id: string | number
      title: string
      price: number | string | undefined | null
    }) => {
      const numericPrice = Number.parseFloat(String(producto.price)) || 0
      const itemExistente = notaVenta.items.find((item) => item.idProducto === producto.id)
      if (itemExistente) {
        const nuevosItems = notaVenta.items.map((item) =>
          item.idProducto === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                total: (item.cantidad + 1) * item.precioUnitario,
              }
            : item,
        )
        setNotaVenta({ ...notaVenta, items: nuevosItems })
      } else {
        const nuevoItem: ItemVenta = {
          key: Date.now().toString(),
          idProducto: producto.id,
          nombre: producto.title,
          cantidad: 1,
          precioUnitario: numericPrice,
          total: numericPrice * 1,
        }
        setNotaVenta({ ...notaVenta, items: [...notaVenta.items, nuevoItem] })
      }
    },
    [notaVenta],
  )

  const actualizarCantidadItem = useCallback(
    (key: string, cantidad: number | null) => {
      if (cantidad === null || cantidad < 0) return
      if (cantidad === 0) {
        eliminarItem(key)
        return
      }
      const nuevosItems = notaVenta.items.map((item) =>
        item.key === key
          ? {
              ...item,
              cantidad: cantidad,
              total: cantidad * item.precioUnitario,
            }
          : item,
      )
      setNotaVenta({ ...notaVenta, items: nuevosItems })
    },
    [notaVenta],
  )

  const eliminarItem = useCallback(
    (key: string) => {
      const nuevosItems = notaVenta.items.filter((item) => item.key !== key)
      setNotaVenta({ ...notaVenta, items: nuevosItems })
    },
    [notaVenta],
  )

  const establecerIdCliente = useCallback((idCliente: string | number | null | undefined) => {
    setNotaVenta((prevNotaVenta) => ({
      ...prevNotaVenta,
      idCliente: idCliente === undefined ? null : idCliente,
    }))
  }, [])

  const establecerObservaciones = useCallback((observaciones: string) => {
    setNotaVenta((prevNotaVenta) => ({
      ...prevNotaVenta,
      observaciones,
    }))
  }, [])

  const [cargandoGuardado, setCargandoGuardado] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>(undefined)
  const [ventaGeneradaExitosa, setVentaGeneradaExitosa] = useState<VentaResponse | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const clearGuardadoState = useCallback(() => {
    setCargandoGuardado(false)
    setErrorGuardado(undefined)
    setVentaGeneradaExitosa(null)
    setShowSuccessModal(false)
  }, [])

  // POST: Crear borrador
  const guardarBorrador = async (warehouseId: string | number | null) => {
    setCargandoGuardado(true)
    setErrorGuardado(undefined)
    setVentaGeneradaExitosa(null)

    if (!notaVenta.idCliente) {
      setErrorGuardado("Debes seleccionar un cliente para guardar el borrador.")
      setCargandoGuardado(false)
      throw new Error("Cliente no seleccionado.")
    }
    if (!warehouseId) {
      setErrorGuardado("Debes seleccionar una bodega para guardar el borrador.")
      setCargandoGuardado(false)
      throw new Error("Bodega no seleccionada.")
    }
    if (notaVenta.items.length === 0) {
      setErrorGuardado("El borrador debe contener al menos un producto.")
      setCargandoGuardado(false)
      throw new Error("No hay productos en la venta.")
    }

    try {
      await SaleService.createSale(notaVenta, "Pendiente", warehouseId)
    } catch (error: any) {
      setErrorGuardado(error.message || "Error al guardar borrador.")
      throw error
    } finally {
      setCargandoGuardado(false)
    }
  }

  // POST: Crear venta nueva
  const generarNotaVentaFinal = async (warehouseId: string | number | null): Promise<VentaResponse> => {
    setCargandoGuardado(true)
    setErrorGuardado(undefined)
    setVentaGeneradaExitosa(null)

    if (!notaVenta.idCliente) {
      setErrorGuardado("Debes seleccionar un cliente para generar la nota de venta.")
      setCargandoGuardado(false)
      throw new Error("Cliente no seleccionado.")
    }
    if (notaVenta.items.length === 0) {
      setErrorGuardado("La nota de venta debe contener al menos un producto.")
      setCargandoGuardado(false)
      throw new Error("No hay productos en la venta.")
    }
    if (!warehouseId) {
      setErrorGuardado("Debes seleccionar una bodega para generar la nota de venta.")
      setCargandoGuardado(false)
      throw new Error("Bodega no seleccionada.")
    }

    try {
      const response = await SaleService.createSale(notaVenta, "Finalizado", warehouseId)
      setVentaGeneradaExitosa(response)
      setShowSuccessModal(true)
      return response
    } catch (error: any) {
      setErrorGuardado(error.message || "Error al generar nota de venta final.")
      throw error
    } finally {
      setCargandoGuardado(false)
    }
  }

  // PATCH: Finalizar borrador existente
  const finalizarBorrador = async (
    saleId: string | number,
    warehouseId: string | number | null,
  ): Promise<VentaResponse> => {
    setCargandoGuardado(true)
    setErrorGuardado(undefined)
    setVentaGeneradaExitosa(null)

    if (!notaVenta.idCliente) {
      setErrorGuardado("Debes seleccionar un cliente para finalizar la venta.")
      setCargandoGuardado(false)
      throw new Error("Cliente no seleccionado.")
    }
    if (!warehouseId) {
      setErrorGuardado("Debes seleccionar una bodega para finalizar la venta.")
      setCargandoGuardado(false)
      throw new Error("Bodega no seleccionada.")
    }
    if (notaVenta.items.length === 0) {
      setErrorGuardado("La venta debe contener al menos un producto.")
      setCargandoGuardado(false)
      throw new Error("No hay productos en la venta.")
    }

    try {
      // Crear el objeto de venta con el formato que espera actualizarEstadoVenta
      const ventaData = {
        warehouse_id: warehouseId,
        client_id: notaVenta.idCliente,
        products: notaVenta.items.map((item) => ({
          id: item.idProducto,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.total,
        })),
        amount_total_products: notaVenta.items.reduce((sum, item) => sum + item.cantidad, 0),
        price_subtotal: subtotal,
        price_final: total,
        observation: notaVenta.observaciones,
        type_emission: null,
      }

      const response = await SaleService.actualizarEstadoVenta(saleId, "Finalizado", ventaData)
      setVentaGeneradaExitosa(response.data)
      setShowSuccessModal(true)
      return response.data
    } catch (error: any) {
      setErrorGuardado(error.message || "Error al finalizar borrador.")
      throw error
    } finally {
      setCargandoGuardado(false)
    }
  }

  const cargarDesdeBorrador = (borrador: NotaVentaActual) => {
    setNotaVenta({
      idCliente: borrador.idCliente ?? null,
      observaciones: borrador.observaciones ?? "",
      items: borrador.items ?? [],
    })
  }

  const limpiarNotaVenta = useCallback(() => {
    setNotaVenta({
      idCliente: null,
      observaciones: "",
      items: [],
    })
  }, [])

  return {
    notaVenta,
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    ventaGeneradaExitosa,
    showSuccessModal,
    clearGuardadoState,

    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente,
    establecerObservaciones,
    guardarBorrador,
    generarNotaVentaFinal,
    finalizarBorrador,
    cargarDesdeBorrador,
    limpiarNotaVenta,
  }
}

export default useGestionNotaVentaActual;
