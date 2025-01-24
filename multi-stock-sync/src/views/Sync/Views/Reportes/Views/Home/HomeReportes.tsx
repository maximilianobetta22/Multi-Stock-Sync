import React from 'react';
import styles from './HomeReportes.module.css';

const HomeReportes: React.FC = () => {
  return (
    <div className={styles.content}>
      <h1>Home Reportes</h1>
      <p>Selecciona una conexión</p>
      <select className="form-control">
      <option value="opcion1">Opción 1</option>
      <option value="opcion2">Opción 2</option>
      <option value="opcion3">Opción 3</option>
      </select>
    </div>
  );
};

export default HomeReportes;
