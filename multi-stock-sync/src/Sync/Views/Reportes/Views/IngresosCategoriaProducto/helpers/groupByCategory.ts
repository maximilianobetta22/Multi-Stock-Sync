import { Categoria, Producto } from "../Interfaces/interfaces";

export const groupByCategory = (productos: Producto[]) => {

  const categoriasGroupById: { [id: string]: Categoria } = {};
 
  productos.forEach((producto) => {
    if (categoriasGroupById[producto.category]) {
      categoriasGroupById[producto.category].total += producto.price * producto.quantity;
      categoriasGroupById[producto.category].cantidadProductos += producto.quantity;
      categoriasGroupById[producto.category].productos.push(producto);
    } else {
      categoriasGroupById[producto.category] = {
        id: producto.category_id,
        category: producto.category,
        cantidadProductos: producto.quantity,
        productos: [producto],
        total: producto.price * producto.quantity,
      };
    }
  });

  return Object.values(categoriasGroupById);
};