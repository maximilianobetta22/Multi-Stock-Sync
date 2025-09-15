import { useState } from "react";
import * as XLSX from "xlsx";

export interface Product {
  id: number; // ID interno para manejo local
  category_id: string;
  title: string;
  sku: string;
  attributes: Record<string, string>; // ej: { BRAND: "Marca X", GENDER: "Hombre" }
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

  const updateProduct = (id: number, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const getTotal = () =>
    products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const exportToExcel = () => {
    const data = products.map(({ id, ...p }) => p); // eliminamos ID local
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "PlanillaProductos.xlsx");
  };

  return {
    products,
    addProduct,
    removeProduct,
    updateProduct,
    getTotal,
    exportToExcel,
  };
};

