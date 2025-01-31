import { formatNumber, groupByIdProduct } from "../helpers";
import { Categoria, Producto } from "../Interfaces/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import styles from "../IngresosCategoriaProducto.module.css";

type ItemTableProps = {
  categoria: Categoria
}

export const ItemTable = ({categoria}:ItemTableProps) => {

  const [menuOpen, setMenuOpen] = useState(false);

  const menuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  groupByIdProduct(categoria.productos);

  return (
    <>
      <tr className={styles.body__row}>
        <td
          onClick={menuToggle} 
          className={`${styles.item__one}`}
        >
          {categoria.category.toUpperCase()}
          {
            (menuOpen)
            ? <FontAwesomeIcon className={styles.item__oneIcon} icon={faChevronUp}/>
            : <FontAwesomeIcon className={styles.item__oneIcon} icon={faChevronDown}/>
          }
        </td>
        <td className={`${styles.item__two}`}>documento</td>
        <td className={`${styles.item__three}`}>{categoria.cantidadProductos}</td>
        <td className={`${styles.item__four}`}>{formatNumber(categoria.total)}</td>
        <td className={`${styles.item__five}`}>{formatNumber(categoria.total)}</td>
      </tr>
      <div className={`${styles.body__containerProducts} ${menuOpen ? styles.body__containerBodyOpen : ''}`}>
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
      </div>
    </>
  )
}