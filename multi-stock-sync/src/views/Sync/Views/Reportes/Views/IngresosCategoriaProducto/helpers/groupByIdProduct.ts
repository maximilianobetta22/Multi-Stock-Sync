import { Producto } from "../Interfaces/interfaces";

export const groupByIdProduct = (productos: Producto[]) => {

  const productosGroupById: { [id: string]: Producto } = {};

  productos.forEach((producto) => {
    if (productosGroupById[producto.id]) {
      productosGroupById[producto.id].quantity += producto.quantity;
    } else {
      productosGroupById[producto.id] = { ...producto };
    }
  });

  return Object.values(productosGroupById);
};