import type React from "react"
import { useState, useRef, useEffect } from "react"
import { type FormInstance, message } from "antd"
import axios from "axios"

export const useCrearProducto = (form: FormInstance) => {
  const [loading, setLoading] = useState(false)
  const [imagenes, setImagenes] = useState<string[]>([])
  const [atributosCategoria, setAtributosCategoria] = useState<any[]>([])
  const [specsDominio, setSpecsDominio] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<string>("")
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [catalogProductId, setCatalogProductId] = useState<string>("")
  const [condicionesCategoria, setCondicionesCategoria] = useState<string[]>([])
  const [categoriasConCatalogoObligatorio, setCategoriasConCatalogoObligatorio] = useState<string[]>([])
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")

  // Variaciones y tallas
  const [tieneVariaciones, setTieneVariaciones] = useState(false)
  const [variaciones, setVariaciones] = useState<any[]>([])
  const [guiasTallas, setGuiasTallas] = useState<any[]>([])
  const [tallasDisponibles, setTallasDisponibles] = useState<any[]>([])
  const [loadingGuiasTallas, setLoadingGuiasTallas] = useState(false)
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>("")
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>("")
  const [dominioId, setDominioId] = useState<string>("")
  const [guiaSeleccionada, setGuiaSeleccionada] = useState<string>("")

  useEffect(() => {
    const selected = form.getFieldValue("catalog_product_id")
    if (selected) setCatalogProductId(selected)
  }, [])

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  })

  const sanitizeTitle = (title: string) => title.replace(/[^a-zA-Z0-9 ]/g, "").trim()

  const validateTitle = (title: string) => {
    let sanitized = sanitizeTitle(title)
    if (sanitized.length > 60) {
      sanitized = sanitized.slice(0, 60)
      message.warning("El título fue truncado a 60 caracteres.")
    }
    return sanitized
  }

  // 1. Predecir categoría y dominio por título
  const predecirCategoria = async (titulo: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/products/${conexion.client_id}/catalogo`,
        {
          params: { title: titulo },
          ...authHeader(),
        },
      )
      const data = response.data
      if (!data.category_id) return message.error("No se pudo predecir la categoría.")

      setCategoryId(data.category_id)
      setDominioId(data.domain_id || "")
      form.setFieldsValue({ category_id: data.category_id })

      if (data.family_name) {
        form.setFieldsValue({ family_name: data.family_name })
      } else {
        form.setFieldsValue({ family_name: "" })
        message.info("Ingresa el nombre de familia manualmente.")
      }

      await obtenerInfoCategoria(data.category_id, data.domain_id || "")
      await obtenerAtributos(data.category_id)

      if (data.products?.length > 0) {
        setCatalogProducts(data.products)
        if (data.products.length === 1) {
          const unico = data.products[0]
          setCatalogProductId(unico.id)
          form.setFieldsValue({ catalog_product_id: unico.id })
          message.info("Se seleccionó automáticamente el único producto del catálogo disponible.")
        } else {
          message.info("Hay productos de catálogo disponibles. Selecciona uno.")
        }
      } else {
        setCatalogProducts([])
        setCatalogProductId("")
        form.setFieldsValue({ catalog_product_id: undefined })
      }
    } catch (error) {
      console.error("❌ Error al predecir categoría:", error)
      message.error("Error al intentar predecir la categoría.")
    }
  }

  // 2. Obtener info de la categoría y specs
  const obtenerInfoCategoria = async (category: string, domainId: string) => {
    const client_id = conexion.client_id
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}?client_id=${client_id}`,
        authHeader(),
      )
      if (data.settings?.catalog_domain_required) {
        setCategoriasConCatalogoObligatorio((prev) => (prev.includes(category) ? prev : [...prev, category]))
      }
      setCondicionesCategoria(data.settings?.item_conditions || ["new", "used"])
      if (domainId) {
        const specsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/specs/${domainId}?client_id=${client_id}`,
          authHeader(),
        )
        if (specsRes.data?.attributes) setSpecsDominio(specsRes.data.attributes)
      }
    } catch (err) {
      console.error("❌ Error al obtener categoría o specs:", err)
      message.error("Error al cargar la categoría o especificaciones técnicas.")
    }
  }

  // 3. Obtener atributos de la categoría
  const obtenerAtributos = async (category: string) => {
    const client_id = conexion.client_id
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}/atributos?client_id=${client_id}`,
        authHeader(),
      )
      setAtributosCategoria(Array.isArray(data) ? data : data.filtered_attributes || [])
    } catch (err) {
      console.error("❌ Error al obtener atributos:", err)
      message.error("Error al cargar los atributos de la categoría.")
    }
  }

  // 4. Obtener guías de tallas
  const obtenerGuiasTallas = async (domainId: string, gender: string | string[], brand: string) => {
    if (!domainId || !gender || !brand) {
      console.log("❌ Faltan parámetros para obtener guías de tallas:", { domainId, gender, brand })
      return
    }

    const client_id = conexion.client_id
    setLoadingGuiasTallas(true)

    try {
      const genderParam = Array.isArray(gender) ? gender.join(",") : gender
      console.log("🔍 Obteniendo guías de tallas con parámetros:", {
        domain_id: domainId,
        gender: genderParam,
        brand: brand,
        client_id,
      })

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/size-guides/${client_id}`, {
        params: {
          domain_id: domainId,
          gender: genderParam,
          brand: brand,
        },
        ...authHeader(),
      })

      console.log("✅ Respuesta de guías de tallas:", data)

      if (data.size_guides && data.size_guides.length > 0) {
        setGuiasTallas(data.size_guides)
        console.log("📏 Guías de tallas establecidas:", data.size_guides.length)

        // Extraer todas las tallas disponibles de todas las guías
        const todasLasTallas: any[] = []
        data.size_guides.forEach((guide: any) => {
          if (guide.rows && guide.rows.length > 0) {
            guide.rows.forEach((row: any) => {
              if (!todasLasTallas.find((t) => t.size === row.size)) {
                todasLasTallas.push({
                  id: row.id,
                  size: row.size,
                  name: row.size,
                })
              }
            })
          }
        })

        setTallasDisponibles(todasLasTallas)
        console.log("👕 Tallas disponibles:", todasLasTallas)

        // Seleccionar automáticamente la primera guía disponible
        const primeraGuia = data.size_guides[0]
        setGuiaSeleccionada(primeraGuia.id)
        form.setFieldsValue({ size_grid_id: primeraGuia.id })
        message.info(`Se seleccionó automáticamente la guía: ${primeraGuia.names?.MLC || primeraGuia.id}`)
      } else {
        console.log("⚠️ No se encontraron guías de tallas")
        setGuiasTallas([])
        setTallasDisponibles([])
        setGuiaSeleccionada("")
        form.setFieldsValue({ size_grid_id: undefined })
        message.warning("No se encontraron guías de tallas para esta combinación de marca y género.")
      }
    } catch (err: any) {
      console.error("❌ Error al obtener guías de tallas:", err)

      // Si es un error 404, significa que el endpoint no existe
      if (err.response?.status === 404) {
        console.log("🔧 Endpoint de guías de tallas no disponible, usando fallback")
        message.warning("Las guías de tallas dinámicas no están disponibles. Puedes continuar sin ellas.")

        // Usar guías estáticas del atributo SIZE_GRID_ID si están disponibles
        const sizeGridAttr = atributosCategoria.find((a) => a.id === "SIZE_GRID_ID")
        if (sizeGridAttr && sizeGridAttr.values && sizeGridAttr.values.length > 0) {
          console.log("📋 Usando guías estáticas del atributo SIZE_GRID_ID")
          // No establecemos guiasTallas para que use las estáticas
          setGuiasTallas([])
          setTallasDisponibles([])
          setGuiaSeleccionada("")
        } else {
          console.log("⚠️ No hay guías estáticas disponibles")
          setGuiasTallas([])
          setTallasDisponibles([])
          setGuiaSeleccionada("")
        }
      } else {
        // Otros errores
        setGuiasTallas([])
        setTallasDisponibles([])
        setGuiaSeleccionada("")
        form.setFieldsValue({ size_grid_id: undefined })

        const errorMsg = err.response?.data?.message || "Error al cargar las guías de tallas."
        message.error(errorMsg)
      }
    } finally {
      setLoadingGuiasTallas(false)
    }
  }

  // 5. Handlers de variaciones
  const agregarVariacion = () => {
    const nuevaVariacion = {
      id: Date.now(),
      color: "",
      size: "",
      fabric_design: "",
      price: form.getFieldValue("price") || 0,
      available_quantity: 1,
      pictures: imagenes.length > 0 ? [imagenes[0]] : [], // Asignar la primera imagen por defecto
      seller_sku: "",
      size_grid_row_id: "",
    }
    setVariaciones((prev) => [...prev, nuevaVariacion])
  }

  const eliminarVariacion = (id: number) => {
    setVariaciones((prev) => prev.filter((v) => v.id !== id))
  }

  const actualizarVariacion = (id: number, campo: string, valor: any) => {
    setVariaciones((prev) => prev.map((v) => (v.id === id ? { ...v, [campo]: valor } : v)))
  }

  // 6. Handlers de atributos especiales
  const onAtributoChange = (atributoId: string, valor: any) => {
    console.log("🔄 Cambio de atributo:", atributoId, valor)
    console.log("📊 Todos los valores del form:", form.getFieldsValue())

    if (atributoId === "BRAND") {
      const brandName = typeof valor === "object" ? valor.label : valor
      setMarcaSeleccionada(brandName)
      console.log("🏷️ Marca seleccionada:", brandName)
      console.log("📊 Estado actual - Género:", generoSeleccionado, "Dominio:", dominioId)

      // Si ya tenemos género y dominio, obtener guías de tallas
      if (generoSeleccionado && dominioId && brandName) {
        console.log("🔍 Obteniendo guías de tallas por cambio de marca")
        obtenerGuiasTallas(dominioId, generoSeleccionado, brandName)
      } else {
        console.log("⚠️ Faltan datos para obtener guías:", {
          genero: generoSeleccionado,
          dominio: dominioId,
          marca: brandName,
        })
      }
    }

    if (atributoId === "GENDER") {
      const genderName = typeof valor === "object" ? valor.label : valor
      setGeneroSeleccionado(genderName)
      console.log("👤 Género seleccionado:", genderName)
      console.log("📊 Estado actual - Marca:", marcaSeleccionada, "Dominio:", dominioId)

      // Si ya tenemos marca y dominio, obtener guías de tallas
      if (marcaSeleccionada && dominioId && genderName) {
        console.log("🔍 Obteniendo guías de tallas por cambio de género")
        obtenerGuiasTallas(dominioId, genderName, marcaSeleccionada)
      } else {
        console.log("⚠️ Faltan datos para obtener guías:", {
          marca: marcaSeleccionada,
          dominio: dominioId,
          genero: genderName,
        })
      }
    }
  }

  // 7. Handler de título (predice categoría)
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value
    const currentFamilyName = form.getFieldValue("family_name")
    if (!currentFamilyName) form.setFieldsValue({ family_name: titulo })
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      if (titulo.length > 4) predecirCategoria(titulo)
    }, 500)
  }

  // 8. Agregar imagen
  const handleAgregarImagen = () => {
    const url = prompt("Ingresa el URL de la imagen:")
    if (url) {
      setImagenes((prev) => [...prev, url])
      message.success("Imagen agregada correctamente.")
    }
  }

  // 9. Handler para selección de guía
  const handleGuiaSeleccionada = (guiaId: string) => {
    console.log("📏 Guía seleccionada:", guiaId)
    setGuiaSeleccionada(guiaId)
    form.setFieldsValue({ size_grid_id: guiaId })

    // Limpiar las filas seleccionadas en las variaciones cuando cambia la guía
    setVariaciones((prev) => prev.map((v) => ({ ...v, size_grid_row_id: "" })))

    // Forzar re-render del componente
    form.validateFields(["size_grid_id"])
  }

  // useEffect para sincronización automática de guías
  useEffect(() => {
    // Si hay guías disponibles pero no hay una seleccionada, seleccionar la primera automáticamente
    if (guiasTallas.length > 0 && !guiaSeleccionada) {
      const primeraGuia = guiasTallas[0]
      setGuiaSeleccionada(primeraGuia.id)
      form.setFieldsValue({ size_grid_id: primeraGuia.id })
    }
  }, [guiasTallas, guiaSeleccionada, form])

  // 10. Envío del producto
  const onFinish = async (values: any) => {
    console.log("🚀 Iniciando envío del producto con valores:", values)

    if (!conexion?.client_id || !categoryId) {
      return message.error("Faltan datos clave para crear el producto.")
    }

    if (!values.condition || imagenes.length === 0 || !values.description || !values.price || !values.quantity) {
      return message.error("Completa todos los campos obligatorios.")
    }

    // Validación de guía de tallas si es requerida o si hay variaciones
    const sizeGridAttr = atributosCategoria.find((a) => a.id === "SIZE_GRID_ID")
    const sizeGridRequired = sizeGridAttr && (sizeGridAttr.tags?.required || sizeGridAttr.tags?.catalog_required)

    // Si hay variaciones, la guía de tallas es obligatoria
    if ((sizeGridRequired || tieneVariaciones) && !values.size_grid_id && !guiaSeleccionada) {
      return message.error("Debes seleccionar una guía de tallas.")
    }

    // Validación de filas de guía de tallas en variaciones
    if (tieneVariaciones && variaciones.length > 0) {
      const variacionesSinFila = variaciones.filter((v) => !v.size_grid_row_id)
      if (variacionesSinFila.length > 0) {
        return message.error("Debes seleccionar la fila de la guía de tallas en todas las variaciones.")
      }
    }

    const tituloFinal = validateTitle(values.title || "")
    const payload: any = {
      category_id: categoryId,
      condition: values.condition,
      price: values.price,
      currency_id: values.currency_id,
      available_quantity: values.quantity,
      listing_type_id: values.listing_type_id,
      pictures: imagenes.map((src) => ({ source: src })),
      shipping: {
        mode: "me2",
        local_pick_up: values.local_pick_up || false,
        free_shipping: values.free_shipping || false,
      },
    }

    // Variaciones
    if (tieneVariaciones && variaciones.length > 0) {
      payload.variations = variaciones.map((variacion) => ({
        attribute_combinations: [
          ...(variacion.color ? [{ id: "COLOR", value_name: variacion.color }] : []),
          ...(variacion.size ? [{ id: "SIZE", value_name: variacion.size }] : []),
          ...(variacion.fabric_design ? [{ id: "FABRIC_DESIGN", value_name: variacion.fabric_design }] : []),
        ],
        attributes: [
          ...(variacion.size_grid_row_id ? [{ id: "SIZE_GRID_ROW_ID", value_name: variacion.size_grid_row_id }] : []),
        ],
        price: variacion.price,
        available_quantity: variacion.available_quantity,
        seller_custom_field: variacion.seller_sku,
        picture_ids: imagenes.length > 0 ? imagenes.slice(0, 1) : [], // Asignar al menos una imagen
      }))

      // El precio principal es el menor de las variaciones
      const precioMinimo = Math.min(...variaciones.map((v) => v.price))
      payload.price = precioMinimo
    }

    // Atributos - Solo los que NO están en las variaciones
    const atributos: any[] = []

    // Agregar atributos que NO son de variaciones
    Object.entries(values.attributes || {}).forEach(([id, value_name]) => {
      // No agregar COLOR, SIZE si hay variaciones
      if (tieneVariaciones && (id === "COLOR" || id === "SIZE")) {
        return
      }
      atributos.push({ id, value_name })
    })

    // Agregar specs
    Object.entries(values.specs || {}).forEach(([id, value_name]) => {
      atributos.push({ id, value_name })
    })

    // Agrega SIZE_GRID_ID dinámicamente
    const sizeGridId = values.size_grid_id || guiaSeleccionada
    if (sizeGridId) {
      if (!atributos.some((a) => a.id === "SIZE_GRID_ID")) {
        atributos.push({
          id: "SIZE_GRID_ID",
          value_name: sizeGridId,
        })
      }
    }

    payload.attributes = atributos

    // Sale terms corregidos
    payload.sale_terms = [
      { id: "WARRANTY_TYPE", value_id: "2230279" }, // ID válido para garantía del vendedor
      { id: "WARRANTY_TIME", value_name: values.warranty_time || "90 días" },
    ]

    // Catálogo
    const requiereCatalogo = categoriasConCatalogoObligatorio.includes(categoryId)
    let catalogIdFinal = form.getFieldValue("catalog_product_id") || catalogProductId || ""

    if (requiereCatalogo) {
      if (catalogProducts.length === 1 && !catalogIdFinal) {
        catalogIdFinal = catalogProducts[0].id
        form.setFieldsValue({ catalog_product_id: catalogIdFinal })
        setCatalogProductId(catalogIdFinal)
        message.info("Se seleccionó automáticamente el único producto del catálogo.")
      }
      if (!catalogIdFinal || catalogIdFinal === "undefined") {
        message.error("Esta categoría requiere seleccionar un producto del catálogo.")
        setLoading(false)
        return
      }
      payload.catalog_product_id = catalogIdFinal
      payload.catalog_listing = true
      delete payload.title
      delete payload.description
      delete payload.family_name
    } else {
      payload.title = tituloFinal
      payload.description = values.description
      payload.family_name = values.family_name || tituloFinal
    }

    // Log final para depuración
    console.log("📦 Payload final a enviar:", JSON.stringify(payload, null, 2))

    try {
      setLoading(true)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/mercadolibre/Products/${conexion.client_id}/crear-producto`,
        payload,
        authHeader(),
      )

      console.log("✅ Producto creado exitosamente:", response.data)
      message.success("✅ Producto subido exitosamente")

      // Reset del formulario
      form.resetFields()
      setImagenes([])
      setAtributosCategoria([])
      setCatalogProducts([])
      setCatalogProductId("")
      setVariaciones([])
      setTieneVariaciones(false)
      setGuiasTallas([])
      setTallasDisponibles([])
      setGuiaSeleccionada("")
      setMarcaSeleccionada("")
      setGeneroSeleccionado("")
    } catch (error: any) {
      const data = error.response?.data
      console.error("❌ Error al crear producto:", data)

      if (data?.ml_error?.cause?.length) {
        const errores = data.ml_error.cause.map((c: any) => `• ${c.message}`).join("\n")
        message.error(`Mercado Libre rechazó el producto:\n${errores}`)
      } else {
        const msg = data?.message || "Hubo un error al subir el producto."
        message.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    imagenes,
    atributosCategoria,
    specsDominio,
    categoryId,
    catalogProducts,
    catalogProductId,
    condicionesCategoria,
    categoriasConCatalogoObligatorio,
    tieneVariaciones,
    variaciones,
    guiasTallas,
    tallasDisponibles,
    loadingGuiasTallas,
    marcaSeleccionada,
    generoSeleccionado,
    dominioId,
    guiaSeleccionada,
    setCatalogProductId,
    setTieneVariaciones,
    setGuiaSeleccionada: handleGuiaSeleccionada,
    agregarVariacion,
    eliminarVariacion,
    actualizarVariacion,
    onAtributoChange,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  }
}
