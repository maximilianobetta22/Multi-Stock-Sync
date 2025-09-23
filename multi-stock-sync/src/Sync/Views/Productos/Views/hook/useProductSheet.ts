import { useState } from "react";
import * as XLSX from "xlsx";

export interface Product {
  id: number; // ID interno para manejo local
  category: string;
  subcategory: string;
  title: string;
  sku: string;
  attributes: Record<string, any>; // atributos dinámicos según categoría
  price: number;
  currency_id: string;
  quantity: number;
  description: string;
  images: string[];
}

export const useProductSheet = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = { id: Date.now(), ...product };
    setProducts((prev) => [...prev, newProduct]);
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getTotal = () =>
    products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const exportToExcel = () => {
    const data = products.map(({ id, attributes, images, ...p }) => {
      const attrWithUnits: Record<string, any> = {};

      Object.keys(attributes).forEach((key) => {
        // Si es peso, le agregamos " KG"
        if (key.toLowerCase() === "peso") {
          attrWithUnits[key] = `${attributes[key]} `;
        } else {
          attrWithUnits[key] = attributes[key];
        }
      });

      return {
        ...p,
        images: images.join(", "), // unimos URLs en una sola celda
        ...attrWithUnits,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "PlanillaProductos.xlsx");
  };

  return {
    products,
    addProduct,
    removeProduct,
    getTotal,
    exportToExcel,
  };
};
