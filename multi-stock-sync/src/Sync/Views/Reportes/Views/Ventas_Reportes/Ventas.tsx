import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Ventas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCalendarWeek,
  faCalendarAlt,
  faChartLine,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

const Ventas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (client_id) navigate(`/sync/reportes/${path}/${client_id}`);
  };

  return (
    <div className={styles.containerPrincipal}>
      <h1 className={styles.tituloPrincipal}>Detalles de Ventas</h1>
      <p className={styles.subtitulo}>
        Selecciona el tipo de reporte que deseas visualizar
      </p>

      <div className={styles.botonesFila}>
        <button
          className={`${styles.boton} ${styles.botonPrimario}`}
          onClick={() => handleNavigate("ventas-dia")}
        >
          <FontAwesomeIcon icon={faCalendarDay} />
          Ventas por Día
        </button>

        <button
          className={`${styles.boton} ${styles.botonPrimario}`}
          onClick={() => handleNavigate("ventas-mes")}
        >
          <FontAwesomeIcon icon={faCalendarWeek} />
          Ventas por Mes
        </button>

        <button
          className={`${styles.boton} ${styles.botonPrimario}`}
          onClick={() => handleNavigate("ventas-year")}
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
          Ventas por Año
        </button>
      </div>

      <p className={styles.subtitulo}>Comparaciones inteligentes</p>

      <div className={styles.botonesFila}>
        <button
          className={`${styles.boton} ${styles.botonSecundario}`}
          onClick={() => handleNavigate("compare-month-month")}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Mes a Mes
        </button>

        <button
          className={`${styles.boton} ${styles.botonSecundario}`}
          onClick={() => handleNavigate("compare-year-year")}
        >
          <FontAwesomeIcon icon={faChartLine} />
          Año a Año
        </button>
      </div>

      <footer className={styles.footer}>
        ---------- Multi Stock Sync ----------
      </footer>
    </div>
  );
};

export default Ventas;
