import { formatNumber, groupByIdProduct } from "../helpers";
import { Categoria, Producto } from "../Interfaces/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import styles from "../IngresosCategoriaProducto.module.css";
import { ItemProduct } from "./ItemProduct";

type ItemCategoryProps = {
  categoria: Categoria
}

export const ItemCategory = ({categoria}:ItemCategoryProps) => {

  const [menuOpen, setMenuOpen] = useState(false);

  const menuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <tr className={styles.body__row}>
        <td
          onClick={menuToggle} 
          className={`${styles.item__one}`}
        >
          {categoria.category.toUpperCase()}
          {
            (menuOpen && categoria.productos.length > 0)
            ? <FontAwesomeIcon className={styles.item__oneIcon} icon={faChevronUp}/>
            : <FontAwesomeIcon className={styles.item__oneIcon} icon={faChevronDown}/>
          }
        </td>
        <td className={`${styles.item__two}`}>documento</td>
        <td className={`${styles.item__three}`}>{categoria.cantidadProductos}</td>
        <td className={`${styles.item__four}`}>-</td>
        <td className={`${styles.item__five}`}>{formatNumber(categoria.total)}</td>
      </tr>
      <div className={`${styles.body__containerProducts} ${menuOpen ? styles.body__containerProductsOpen : ''}`}>
        {
          groupByIdProduct(categoria.productos)?.map((producto:Producto, indice) => (
            <ItemProduct 
              key={producto.id}
              producto={producto} 
              indice={indice + 1}
            />
          ))
        }
      </div>
    </>
  )
}