import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './HomeSync.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBoxOpen,faWarehouse,faPlug, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

const HomeSync: React.FC = () => {    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <br />
                <h1>Multi Stock Sync</h1>
                <h4>Panel de sincronización</h4>
                <br />
                <h4>Seleccione una opción para comenzar:</h4>
            </div>
            <br />      
            <div className={`${styles.buttonsContainer} mt-4`}>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faBoxOpen} size="5x" className={`${styles.icon} ${styles.icon_products_color}`} />
                    <NavLink to={"/sync/productos"} className={`${styles.button} ${styles.products_color}`}>Productos</NavLink>
                </div>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faWarehouse} size="5x" className={`${styles.icon} ${styles.icon_warehouses_color}`} />
                    <NavLink to={"/sync/bodegas"} className={`${styles.button} ${styles.warehouses_color}`}>Bodegas</NavLink>
                </div>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faPlug} size="5x" className={`${styles.icon} ${styles.icon_connections_color}`} />
                    <NavLink to={"/sync/conexiones"} className={`${styles.button} ${styles.connections_color}`}>Conexiones a ML</NavLink>
                </div>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faBriefcase} size="5x" className={`${styles.icon} ${styles.icon_companies_color}`} />
                    <NavLink to={"/sync/companias"} className={`${styles.button} ${styles.companies_color}`}>Compañías</NavLink>
                </div>
            </div>
        </div> 
    );
};
export default HomeSync;
