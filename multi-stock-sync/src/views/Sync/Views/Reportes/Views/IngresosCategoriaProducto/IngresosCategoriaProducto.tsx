import { useState } from "react";
import styles from "./IngresosCategoriaProducto.module.css";

type eventChange = React.ChangeEvent<HTMLInputElement>;

export const IngresosCategoriaProducto = () => {

  const [ initDate, setInitDate ] = useState<string>('');
  const [ endDate, setEndDate ] = useState<string>('');

  const handleInitDateChange = (event: eventChange) => {
    setInitDate(event.target.value);
  };

  const handleEndDateChange = (event: eventChange) => {
    setEndDate(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(initDate, endDate)
  };

  return (
    <div className={styles.view__container}>
      <div className={styles.container__left}>
        <form onSubmit={handleSubmit} className={styles.left__header}>
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
            className={styles.header__btnDate} 
            onChange={handleInitDateChange}
            type="date"
            value={initDate}
          >  
          </input>
          <input 
            id="endDate"
            className={styles.header__btnDate} 
            onChange={handleEndDateChange}
            type="date"
            value={endDate}
          >
          </input>
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.header__btnBuscar}`}
          >
            Buscar
          </button>
        </form>
        <div className={styles.left__graphic}>

        </div>
        <div className={styles.left__data}>

        </div>
      </div>
      <div className={styles.container__right}>

      </div>
    </div>
  );
};