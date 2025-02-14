import { Pie } from "react-chartjs-2";
import { createRandomColors } from "../helpers";
import { useContext, useMemo } from "react";
import { IngresosProductosContext } from "../Context/IngresosProductosContext";

import styles from "../IngresosCategoriaProducto.module.css";

export const PieChart = () => {

  const { ProductoState } = useContext(IngresosProductosContext);
  const{ categorias } = ProductoState;

  const memoData = useMemo(() => {
    return categorias.map((categoria) => {
      return categoria.total;
    });
  }, [categorias])

  const memoEtiquetas = useMemo(() => {
    return categorias.map((categoria) => {
      return categoria.category;
    });
  },[categorias])

  const memoColors = useMemo(() => {
    return createRandomColors({ quantity: categorias.length })
  }, [categorias])

  return (
    <div className={styles.left__graphic}>
      {/**CONTENEDOR DEL GRAFICO **/}
      <div className={styles.graphic__container}>
        <Pie
          data={{
            labels: memoEtiquetas,
            datasets: [
              {
                label: 'Ganancia por día',
                data: memoData,
                backgroundColor: memoColors,
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              datalabels: {
                display: false,
              },
            },
          }}
        />
      </div>
      {/**LABELS DEL GRAFICO */}
      <div className={styles.graphic__data}>
        <ul className={styles.data__list}>
          {
            memoEtiquetas.map((categoria, index) => (
              <li key={index} className={styles.data__item}>
                <div className={styles.item__color} style={{ backgroundColor: memoColors[index] }}></div>
                <p className={styles.item__categoria}>{categoria}</p>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
};