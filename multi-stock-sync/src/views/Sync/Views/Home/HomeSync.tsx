import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeSync.module.css';

const HomeSync: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Bienvenido a Sincronización</h1>
                <p>Seleccione una opción para comenzar</p>
            </div>
            <div className={styles.grid}>
                <Link to="/sync/productos" className={styles.link}>
                    <div className={styles.card}>
                        <img src="/assets/img/logo/logo-normal.svg" alt="Productos" className={styles.cardImage} />
                        <h3>Productos</h3>
                        <p>Administrar y gestionar productos del sistema.</p>
                    </div>
                </Link>
                <Link to="/sync/bodegas" className={styles.link}>
                    <div className={styles.card}>
                        <img src="/assets/img/logo/logo-normal.svg" alt="Bodegas" className={styles.cardImage} />
                        <h3>Bodegas</h3>
                        <p>Administrar y gestionar la lista de bodegas.</p>
                    </div>
                </Link>
                <Link to="/sync" className={styles.link}>
                    <div className={styles.card}>
                        <img src="/assets/img/logo/logo-normal.svg" alt="Lorem Ipsum 1" className={styles.cardImage} />
                        <h3>Lorem Ipsum 1</h3>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </Link>
                <Link to="/sync" className={styles.link}>
                    <div className={styles.card}>
                        <img src="/assets/img/logo/logo-normal.svg" alt="Lorem Ipsum 2" className={styles.cardImage} />
                        <h3>Lorem Ipsum 2</h3>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HomeSync;