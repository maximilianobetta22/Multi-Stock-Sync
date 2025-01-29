import { useState } from "react";
import { PieChart } from "./Graphic";

import styles from "./IngresosCategoriaProducto.module.css";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type eventChange = React.ChangeEvent<HTMLInputElement>;
type eventForm = React.FormEvent<HTMLFormElement>;

const IngresosCategoriaProducto = () => {

  const [initDate, setInitDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleInitDateChange = ({ target }: eventChange) => {
    const date = target.value;
    setInitDate(date);
  };

  const handleEndDateChange = ({ target }: eventChange) => {
    const date = target.value
    setEndDate(date);
  };

  const handleSubmit = (e: eventForm) => {
    e.preventDefault();
    console.log(initDate, endDate)
  };

  return (
    <div className={styles.view__container}>
      {/**CONTENIDO IZQUIERDO */}
      <div className={`border ${styles.container__left}`}>
        {/**CONTENEDOR HEADER */}
        <form onSubmit={handleSubmit} className={`${styles.left__header}`}>
          <div className="dropdown">
            <button className={`dropdown-toggle ${styles.header__dropdown}`} type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Productos
            </button>
            <ul className="dropdown-menu">
              <li className={`dropdown-item ${styles.dropdown__item}`} >Poleras</li>
              <li className={`dropdown-item ${styles.dropdown__item}`} >Pantalones</li>
              <li className={`dropdown-item ${styles.dropdown__item}`} >Chaquetas</li>
              <li className={`dropdown-item ${styles.dropdown__item}`} >Lentes</li>
            </ul>
          </div>
          <input
            id="initDate"
            className={`form-control ${styles.header__btnDate}`}
            onChange={handleInitDateChange}
            type="date"
            value={initDate}
          >
          </input>
          <input
            id="endDate"
            className={`form-control ${styles.header__btnDate}`}
            onChange={handleEndDateChange}
            type="date"
            value={endDate}
          >
          </input>
          <button
            type="submit"
            className={`btn ${styles.header__btnBuscar}`}
          >
            Buscar
          </button>
        </form>
        {/**GRAFICO */}
        <PieChart />
        {/**CONTENEDOR DE DATOS */}
        <div className={styles.left__data}>
          <table className={styles.data__table}>
            <thead className={styles.table__head}>
              <tr className={styles.head__row}>
                <th>Tipo de producto</th>
                <th></th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Margen</th>
              </tr>
            </thead>
            <tbody className={styles.table__body}>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
              <tr className={styles.body__row}>
                <td>POLERA</td>
                <td>documento</td>
                <td>10</td>
                <td>$10.000</td>
                <td>$13.000</td>
              </tr>
            </tbody>
          </table>
          <div className={styles.data__total}>
            <div className={styles.total__item}>
              <div className={styles.item__total}>
                <p className={styles.total__p}>Total de ingresos</p>
                <p className={styles.total__p}>$19.000</p>
              </div>
            </div>
            <div className={styles.total__buttonExport}>
              <div className={styles.buttonExport__container}>
                <button className={styles.buttonExport_btn}>
                  <FontAwesomeIcon className={`${styles.btn__icon}`} icon={faDownload} />
                  Exportar a Pdf
                </button>
                <button className={styles.buttonExport_btn}>
                  <FontAwesomeIcon className={`${styles.btn__icon}`} icon={faDownload} />
                  Exportar a Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/**CONTENIDO DERECHO */}
      <div className={styles.container__right}>

      </div>
    </div>
  );
};

export default IngresosCategoriaProducto;