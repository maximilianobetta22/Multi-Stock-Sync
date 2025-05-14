import { useState, useRef } from "react";
import { FormInstance, message } from "antd";
import axios from "axios";

export const useCrearProducto = (form: FormInstance) => {
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [atributosCategoria, setAtributosCategoria] = useState<any[]>([]);
  const [specsDominio, setSpecsDominio] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [familyName, setFamilyName] = useState<string>("");
  const [domainName, setDomainName] = useState<string>("");
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogProductId, setCatalogProductId] = useState<string>("");
  const [condicionesCategoria, setCondicionesCategoria] = useState<string[]>([]);
  const [categoriasConCatalogoObligatorio, setCategoriasConCatalogoObligatorio] = useState<string[]>([]);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

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
    try {
      const token = localStorage.getItem("token");
      const client_id = conexion.client_id;

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}?client_id=${client_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (specsRes.data?.attributes) setSpecsDominio(specsRes.data.attributes);
      }
    } catch (err) {
      console.error("❌ Error al obtener categoría o specs:", err);
      message.error("Error al cargar la categoría o especificaciones técnicas.");
    }
  };

  const obtenerAtributos = async (category: string) => {
    try {
      const token = localStorage.getItem("token");
      const client_id = conexion.client_id;

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/categoria/${category}/atributos?client_id=${client_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAtributosCategoria(data);
    } catch (err) {
      console.error("❌ Error al obtener atributos:", err);
      message.error("Error al cargar los atributos de la categoría.");
    }
  };

  const predecirCategoria = async (titulo: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/products/${conexion.client_id}/catalogo`,
        {
          params: { title: titulo },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (!data.category_id) {
        message.error("No se pudo predecir la categoría.");
        return;
      }

      setCategoryId(data.category_id);
      if (data.family_name) {
  setFamilyName(data.family_name);
  form.setFieldsValue({ family_name: data.family_name });
} else {
  setFamilyName(""); // deja vacío para que lo escriba el usuario
  form.setFieldsValue({ family_name: "" });
  message.warning("ℹ️ Debes ingresar el nombre de familia manualmente.");
}

      setDomainName(data.domain_id || "");
      form.setFieldsValue({ category_id: data.category_id });

      await obtenerInfoCategoria(data.category_id, data.domain_id || "");
      await obtenerAtributos(data.category_id);

      if (data.products?.length > 0) {
        setCatalogProducts(data.products);
        const producto = data.products[0];
        setCatalogProductId(producto.id);
        form.setFieldsValue({ catalog_product_id: producto.id });
        setTimeout(() => form.scrollToField("catalog_product_id"), 300);
        message.info(`Producto catálogo auto-seleccionado: ${producto.name}`);
      } else {
        setCatalogProducts([]);
        setCatalogProductId("");
        form.setFieldsValue({ catalog_product_id: undefined });
        message.success("✅ Categoría detectada sin catálogo obligatorio.");
      }
    } catch (error) {
      console.error("❌ Error al predecir categoría:", error);
      message.error("Error al intentar predecir la categoría.");
    }
  };

const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const titulo = e.target.value;

  // Solo autocompletar family_name si está vacío
  const currentFamilyName = form.getFieldValue("family_name");
  if (!currentFamilyName) {
    form.setFieldsValue({ family_name: titulo });
  }

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
  if (!conexion?.client_id) return message.error("No hay tienda seleccionada.");
  if (!categoryId) return message.error("No se detectó categoría.");
  if (!values.condition) return message.error("Condición requerida.");
  if (imagenes.length === 0) return message.error("Agrega al menos una imagen.");
  if (!values.description) return message.error("Descripción requerida.");
  if (!values.price) return message.error("Precio requerido.");
  if (!values.quantity) return message.error("Cantidad requerida.");

  const tituloFinal = validateTitle(values.title || "");

  const payload: any = {
    category_id: categoryId,
    condition: values.condition,
    price: values.price,
    currency_id: values.currency_id,
    available_quantity: values.quantity,
    description: values.description,
    listing_type_id: values.listing_type_id,
    pictures: imagenes.map((src) => ({ source: src })),
    shipping: {
      mode: "me2",
      local_pick_up: values.local_pick_up || false,
      free_shipping: values.free_shipping || false,
    },
  };

  if (!catalogProductId && tituloFinal) {
    payload.title = tituloFinal;
  }

  // ✅ Agregar family_name si NO se usa catálogo
  if (!catalogProductId) {
    payload.family_name = tituloFinal;
  }

  if (catalogProductId && catalogProductId !== "undefined") {
    payload.catalog_product_id = catalogProductId;
    payload.catalog_listing = true;
  }

  const atributos = [
    ...Object.entries(values.attributes || {}).map(([id, value_name]) => ({ id, value_name })),
    ...Object.entries(values.specs || {}).map(([id, value_name]) => ({ id, value_name })),
  ];
  if (atributos.length > 0) payload.attributes = atributos;

  payload.sale_terms = [
  { id: "WARRANTY_TYPE", value_name: "Garantía del vendedor" },
  { id: "WARRANTY_TIME", value_name: "90 días" },
];


  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    console.log("📦 Payload final:", payload);
    console.log("✅ family_name enviado:", payload.family_name);

    await axios.post(
      `${import.meta.env.VITE_API_URL}/mercadolibre/Products/${conexion.client_id}/crear-producto`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
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
      message.error(`Mercado Libre rechazó el producto por:\n${errores}`);
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
    familyName,
    domainName,
    catalogProducts,
    catalogProductId,
    condicionesCategoria,
    categoriasConCatalogoObligatorio,
    setFamilyName,
    setCatalogProductId,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  };
};
