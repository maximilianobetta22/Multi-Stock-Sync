import { useState, useRef, useEffect } from "react";
import { FormInstance, message } from "antd";
import axios from "axios";

export const useCrearProducto = (form: FormInstance) => {
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [atributosCategoria, setAtributosCategoria] = useState<any[]>([]);
  const [specsDominio, setSpecsDominio] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogProductId, setCatalogProductId] = useState<string>("");
  const [condicionesCategoria, setCondicionesCategoria] = useState<string[]>([]);
  const [categoriasConCatalogoObligatorio, setCategoriasConCatalogoObligatorio] = useState<string[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  useEffect(() => {
    const selected = form.getFieldValue("catalog_product_id");
    if (selected) setCatalogProductId(selected);
  }, []);

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  });

  const sanitizeTitle = (title: string) => title.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  const validateTitle = (title: string) => {
    let sanitized = sanitizeTitle(title);
    if (sanitized.length > 60) {
      sanitized = sanitized.slice(0, 60);
      message.warning("El título fue truncado a 60 caracteres.");
    }
    return sanitized;
  };

  const obtenerInfoCategoria = async (category: string, domainId: string) => {
    const client_id = conexion.client_id;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}?client_id=${client_id}`,
        authHeader()
      );

      if (data.settings?.catalog_domain_required) {
        setCategoriasConCatalogoObligatorio((prev) =>
          prev.includes(category) ? prev : [...prev, category]
        );
      }

      setCondicionesCategoria(data.settings?.item_conditions || ["new", "used"]);

      if (domainId) {
        const specsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/specs/${domainId}?client_id=${client_id}`,
          authHeader()
        );
        if (specsRes.data?.attributes) setSpecsDominio(specsRes.data.attributes);
      }
    } catch (err) {
      console.error("❌ Error al obtener categoría o specs:", err);
      message.error("Error al cargar la categoría o especificaciones técnicas.");
    }
  };

  const obtenerAtributos = async (category: string) => {
    const client_id = conexion.client_id;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}/atributos?client_id=${client_id}`,
        authHeader()
      );
      setAtributosCategoria(data);
    } catch (err) {
      console.error("❌ Error al obtener atributos:", err);
      message.error("Error al cargar los atributos de la categoría.");
    }
  };

  const predecirCategoria = async (titulo: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/products/${conexion.client_id}/catalogo`,
        {
          params: { title: titulo },
          ...authHeader(),
        }
      );

      const data = response.data;
      if (!data.category_id) return message.error("No se pudo predecir la categoría.");

      setCategoryId(data.category_id);
      form.setFieldsValue({ category_id: data.category_id });

      if (data.family_name) {
        form.setFieldsValue({ family_name: data.family_name });
      } else {
        form.setFieldsValue({ family_name: "" });
        message.info("Ingresa el nombre de familia manualmente.");
      }

      await obtenerInfoCategoria(data.category_id, data.domain_id || "");
      await obtenerAtributos(data.category_id);

      if (data.products?.length > 0) {
        setCatalogProducts(data.products);
        if (data.products.length === 1) {
          const unico = data.products[0];
          setCatalogProductId(unico.id);
          form.setFieldsValue({ catalog_product_id: unico.id });
          message.info("Se seleccionó automáticamente el único producto del catálogo disponible.");
        } else {
          message.info("Hay productos de catálogo disponibles. Selecciona uno.");
        }
      } else {
        setCatalogProducts([]);
        setCatalogProductId("");
        form.setFieldsValue({ catalog_product_id: undefined });
      }
    } catch (error) {
      console.error("❌ Error al predecir categoría:", error);
      message.error("Error al intentar predecir la categoría.");
    }
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    const currentFamilyName = form.getFieldValue("family_name");
    if (!currentFamilyName) form.setFieldsValue({ family_name: titulo });

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (titulo.length > 4) predecirCategoria(titulo);
    }, 500);
  };

  const handleAgregarImagen = () => {
    const url = prompt("Ingresa el URL de la imagen:");
    if (url) {
      setImagenes((prev) => [...prev, url]);
      message.success("Imagen agregada correctamente.");
    }
  };

  const onFinish = async (values: any) => {
    if (!conexion?.client_id || !categoryId)
      return message.error("Faltan datos clave.");

    if (!values.condition || imagenes.length === 0 || !values.description || !values.price || !values.quantity) {
      return message.error("Completa todos los campos obligatorios.");
    }

    const tituloFinal = validateTitle(values.title || "");
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
    };

    const atributos: any[] = [
      ...Object.entries(values.attributes || {}).map(([id, value_name]) => ({ id, value_name })),
      ...Object.entries(values.specs || {}).map(([id, value_name]) => ({ id, value_name })),
    ];

    const sizeGridAttr = atributosCategoria.find((attr) => attr.id === "SIZE_GRID_ID");
    const validGrids = sizeGridAttr?.values?.map((v: any) => v.id) || [];

    if (values.size_grid_id && validGrids.includes(values.size_grid_id)) {
      atributos.push({
        id: "SIZE_GRID_ID",
        value_id: values.size_grid_id,
      });
    }

    payload.attributes = atributos;
    payload.sale_terms = [
      { id: "WARRANTY_TYPE", value_name: "Garantía del vendedor" },
      { id: "WARRANTY_TIME", value_name: "90 días" },
    ];

    // --- 🔁 Nuevo bloque corregido para catálogo ---
    const requiereCatalogo = categoriasConCatalogoObligatorio.includes(categoryId);
    let catalogIdFinal = form.getFieldValue("catalog_product_id") || catalogProductId || "";

    console.log("📌 ¿Requiere catálogo?:", requiereCatalogo);
    console.log("📌 catalog_product_id desde form:", form.getFieldValue("catalog_product_id"));
    console.log("📌 catalog_product_id desde estado:", catalogProductId);

    if (requiereCatalogo) {
      if (catalogProducts.length === 1 && !catalogIdFinal) {
        catalogIdFinal = catalogProducts[0].id;
        form.setFieldsValue({ catalog_product_id: catalogIdFinal });
        setCatalogProductId(catalogIdFinal);
        message.info("Se seleccionó automáticamente el único producto del catálogo.");
      }

      if (!catalogIdFinal || catalogIdFinal === "undefined") {
        message.error("Esta categoría requiere seleccionar un producto del catálogo.");
        setLoading(false);
        return;
      }

      payload.catalog_product_id = catalogIdFinal;
      payload.catalog_listing = true;
      delete payload.title;
      delete payload.description;
      delete payload.family_name;
    } else {
      payload.title = tituloFinal;
      payload.description = values.description;
      payload.family_name = values.family_name || tituloFinal;
    }

    console.log("📦 Payload final:", payload);
    console.log("📌 ¿Tiene catálogo?:", payload.catalog_product_id);

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/mercadolibre/Products/${conexion.client_id}/crear-producto`,
        payload,
        authHeader()
      );
      message.success("✅ Producto subido exitosamente");
      form.resetFields();
      setImagenes([]);
      setAtributosCategoria([]);
      setCatalogProducts([]);
      setCatalogProductId("");
    } catch (error: any) {
      const data = error.response?.data;
      console.error("❌ Error al crear producto:", data);
      if (data?.ml_error?.cause?.length) {
        const errores = data.ml_error.cause.map((c: any) => `• ${c.message}`).join("\n");
        message.error(`Mercado Libre rechazó el producto:\n${errores}`);
      } else {
        const msg = data?.message || "Hubo un error al subir el producto.";
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

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
    setCatalogProductId,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  };
};
