import { Pie } from "react-chartjs-2";
import styles from "../IngresosCategoriaProducto.module.css";
import { createRandomColors } from "../helpers";
import { useContext } from "react";
import { IngresosProductosContext } from "../Context/IngresosProductosContext";

export const PieChart = () => {

  const { ProductoState } = useContext(IngresosProductosContext);
  const{ categorias } = ProductoState;

  const data = categorias.map((categoria) => {
    return categoria.total;
  });

  const etiquetas = categorias.map((categoria) => {
    return categoria.category
  });

  const colors = createRandomColors({ amount: categorias.length })

  return (
    <div className={styles.left__graphic}>
      {/**CONTENEDOR DEL GRAFICO **/}
      <div className={styles.graphic__container}>
        <Pie
          data={{
            labels: etiquetas,
            datasets: [
              {
                label: 'Ganancia por día',
                data: data,
                backgroundColor: colors,
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
            etiquetas.map((categoria, index) => (
              <li key={index} className={styles.data__item}>
                <div className={styles.item__color} style={{ backgroundColor: colors[index] }}></div>
                <p className={styles.item__categoria}>{categoria}</p>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
};