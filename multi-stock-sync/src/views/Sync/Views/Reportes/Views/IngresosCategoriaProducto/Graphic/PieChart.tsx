import { Pie } from "react-chartjs-2";
import styles from "../IngresosCategoriaProducto.module.css";
import { createRandomColors } from "../helpers";

export const PieChart = () => {

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo','Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
  const ganancias = [1000, 22030, 2111, 22022, 33333, 12222, 10000, 1000, 22030, 2111, 22022, 33333, 12222, 10000]

  const colors = createRandomColors({ amount: dias.length })

  return (
    <div className={styles.left__graphic}>
      {/**CONTENEDOR DEL GRAFICO */}
      <div className={styles.graphic__container}>
        <Pie
          data={{
            labels: dias,
            datasets: [
              {
                label: 'Ganancia por día',
                data: ganancias,
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
              tooltip: {
                enabled: false, // Deshabilita los tooltips
              },
              datalabels: {
                display: false, // Deshabilita las etiquetas de datos
              },
            },
          }}
        />
      </div>
      {/**LABELS DEL GRAFICO */}
      <div className={styles.graphic__data}>
        <ul className={styles.data__list}>
          {
            dias.map((dia, index) => (
              <li key={index} className={styles.data__item}>
                <div className={styles.item__color} style={{ backgroundColor: colors[index] }}></div>
                <p className={styles.item__categoria}>{dia}</p>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
};