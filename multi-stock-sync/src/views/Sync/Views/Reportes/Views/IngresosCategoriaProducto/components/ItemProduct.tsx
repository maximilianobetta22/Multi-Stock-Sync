import { formatNumber } from "../helpers";
import styles from "../IngresosCategoriaProducto.module.css";
import { Producto } from "../Interfaces/interfaces";

interface ItemProductProps {
  producto: Producto;
  indice: number;
}

export const ItemProduct = ({producto, indice}: ItemProductProps ) => {

  return (
    <tr key={producto.id} className={`${styles.body__categoryRow}`}>
      <td className={`${styles.item__categoryOne}`}>{`${(indice)}. `}{producto.title}</td>
      <td className={`${styles.item__categoryTwo}`}>documento</td>
      <td className={`${styles.item__categoryThree}`}>{producto.quantity}</td>
      <td className={`${styles.item__categoryFour}`}>{formatNumber(producto.price)}</td>
      <td className={`${styles.item__categoryFive}`}>{formatNumber(producto.total)}</td>
    </tr>
  );
};