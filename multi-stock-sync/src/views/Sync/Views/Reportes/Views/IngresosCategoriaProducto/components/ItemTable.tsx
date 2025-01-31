import { formatNumber, groupByIdProduct } from "../helpers"
import { Categoria, Producto } from "../Interfaces/interfaces"
import styles from "../IngresosCategoriaProducto.module.css";

type ItemTableProps = {
  categoria: Categoria
}

export const ItemTable = ({categoria}:ItemTableProps) => {

  groupByIdProduct(categoria.productos);

  return (
    <>
      <tr className={styles.body__row}>
        <td className={`${styles.item__one}`}>{categoria.category.toUpperCase()}</td>
        <td className={`${styles.item__two}`}>documento</td>
        <td className={`${styles.item__three}`}>{categoria.cantidadProductos}</td>
        <td className={`${styles.item__four}`}>{formatNumber(categoria.total)}</td>
        <td className={`${styles.item__five}`}>{formatNumber(categoria.total)}</td>
      </tr>
      {
        groupByIdProduct(categoria.productos)?.map((producto:Producto) => (
          <tr key={producto.id} className={`${styles.body__categoryRow}`}> 
            <td className={`${styles.item__categoryOne}`}>{producto.title}</td>
            <td className={`${styles.item__categoryTwo}`}>documento</td>
            <td className={`${styles.item__categoryThree}`}>{producto.quantity}</td>
            <td className={`${styles.item__categoryFour}`}>{formatNumber(producto.price)}</td>
            <td className={`${styles.item__categoryFive}`}>{formatNumber(producto.price * producto.quantity)}</td>
          </tr>
        ))
      }
    </>
  )
}