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

  const obtenerCondicionesYCatalogo = async (category: string, domainId: string) => {
    try {
      const { data } = await axios.get(`https://api.mercadolibre.com/categories/${category}`);
      
      if (data.settings?.catalog_domain_required) {
        setCategoriasConCatalogoObligatorio((prev) =>
          prev.includes(category) ? prev : [...prev, category]
        );
      }
  
      setCondicionesCategoria(data.item_conditions || ["new", "used"]);
  
      if (domainId) {
        const specs = await axios.get(`https://api.mercadolibre.com/domains/${domainId}/technical_specs`);
        if (specs.data?.attributes) setSpecsDominio(specs.data.attributes);
      }
    } catch (error) {
      console.error("🔴 Error al obtener condiciones o specs:", error);
    }
  };
  
  const predecirCategoria = async (titulo: string) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/products/${conexion.client_id}/catalogo`,
        {
          params: { title: titulo },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
  
      const data = response.data;
  
      if (!data.category_id) {
        message.error("No se pudo predecir la categoría.");
        return;
      }
  
      setCategoryId(data.category_id);
      setFamilyName(data.family_name || "");
      setDomainName(data.domain_id || ""); // ✅ usa domain_id
      form.setFieldsValue({ category_id: data.category_id });
  
      await obtenerCondicionesYCatalogo(data.category_id, data.domain_id || ""); // ✅ usa domain_id
  
      const atributosRes = await axios.get(
        `https://api.mercadolibre.com/categories/${data.category_id}/attributes`
      );
      setAtributosCategoria(atributosRes.data);
  
      if (data.products?.length > 0) {
        setCatalogProducts(data.products);
        const producto = data.products[0];
        setCatalogProductId(producto.id);
        form.setFieldsValue({ catalog_product_id: producto.id });
        setTimeout(() => form.scrollToField("catalog_product_id"), 300);
        message.info(`Producto catálogo auto-seleccionado: ${producto.name}`);
      } else {
        setCatalogProducts([]);
        form.setFieldsValue({ catalog_product_id: undefined });
        message.success("✅ Categoría detectada sin catálogo obligatorio.");
      }
    } catch (error: any) {
      console.error("❌ Error al predecir categoría:", error);
      message.error("Ocurrió un error al predecir la categoría.");
    }
  };
  

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (titulo.length > 4) predecirCategoria(titulo);
    }, 500);
  };

  const handleAgregarImagen = () => {
    const url = prompt("Ingresa el URL de la imagen:");
    if (url) {
      setImagenes((prev) => [...prev, url]);
      message.success("Imagen agregada correctamente");
    }
  };

  const onFinish = async (values: any) => {
    if (!conexion?.client_id) return message.error("No hay tienda seleccionada.");
    if (!categoryId) return message.error("No se detectó categoría.");
    if (!values.condition) return message.error("Condición requerida.");
    if (imagenes.length === 0) return message.error("Agrega al menos una imagen.");

    const tieneCatalogo = !!catalogProductId;
    const requiereCatalogo = categoriasConCatalogoObligatorio.includes(categoryId);

    if (requiereCatalogo && !catalogProductId) {
      return message.error("Esta categoría exige uso de catálogo.");
    }

    let payload: any;
    if (tieneCatalogo) {
      const producto = catalogProducts.find((p) => p.id === catalogProductId);
      if (!producto) return message.error("Producto de catálogo no encontrado.");
      setFamilyName(producto.family_name || producto.domain_name || "");

      payload = {
        catalog_product_id: catalogProductId,
        category_id: categoryId,
        condition: values.condition,
        price: values.price,
        currency_id: values.currency_id,
        available_quantity: values.quantity,
        listing_type_id: values.listing_type_id,
        pictures: imagenes.map((src) => ({ source: src })),
        sale_terms: [
          { id: "WARRANTY_TYPE", value_name: values.warranty_type || "Garantía del vendedor" },
          { id: "WARRANTY_TIME", value_name: values.warranty_time || "90 días" },
        ],
        shipping: {
          mode: "me2",
          local_pick_up: values.local_pick_up || false,
          free_shipping: values.free_shipping || false,
        },
        family_name: domainName || familyName,
      };
    } else {
      const titulo = validateTitle(values.title);
      payload = {
        title: titulo,
        description: values.description,
        category_id: categoryId,
        family_name: domainName || familyName,
        condition: values.condition,
        price: values.price,
        currency_id: values.currency_id,
        available_quantity: values.quantity,
        listing_type_id: values.listing_type_id,
        pictures: imagenes.map((src) => ({ source: src })),
        sale_terms: [
          { id: "WARRANTY_TYPE", value_name: values.warranty_type || "Garantía del vendedor" },
          { id: "WARRANTY_TIME", value_name: values.warranty_time || "90 días" },
        ],
        shipping: {
          mode: "me2",
          local_pick_up: values.local_pick_up || false,
          free_shipping: values.free_shipping || false,
        },
        attributes: [
          ...Object.entries(values.attributes || {}).map(([id, value_name]) => ({ id, value_name })),
          ...Object.entries(values.specs || {}).map(([id, value_name]) => ({ id, value_name })),
        ],
      };
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

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
      console.error("❌ Error al crear producto:", error.response?.data || error);
      message.error("Hubo un error al subir el producto.");
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
    setCatalogProductId,
    onTitleChange,
    handleAgregarImagen,
    onFinish,
  };
};
