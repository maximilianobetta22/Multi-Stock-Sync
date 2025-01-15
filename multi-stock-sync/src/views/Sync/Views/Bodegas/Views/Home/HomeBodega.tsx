import styles from "./HomeBodega.module.css";

const HomeBodega = () => {
    return (
        <div className={styles.scrol}>
            <header className={styles.header}>
                <img src="/assets/img/logo_empresa.png" alt="Logo de la empresa" className={styles.backgroundImg} />
                <div className={styles.headerContent}>
                    <h1 className={styles.title}></h1>
                </div>
            </header>
            <div>
                <div className={styles.container}>
                    <div>
                        <h1 className={styles.h1}>Home Bodega</h1>
                        <p className={styles.p}>Estas son tus bodegas</p>
                        <div className={styles.row}>
                            {/*Tarjeta numero 1 de la bodega de chile express*/}
                            <div className={styles.card}>
                            <img src="/assets/img/mercado_libre.webp" className={styles.img} />
                            <h5 className="card-title">Bodega 1</h5>
                                <p className={styles.p}>Bodega destinada al almacenamiento y organización de los productos, listos para su gestión.
                                </p>
                                <a href="#" className={styles.btn}>Bodega 1</a>
                            </div>
                            {/*Tarjeta numero 2 de la bodega de chile express*/}
                            <div className={styles.card}>
                            <img src="/assets/img/mercado_libre.webp" className={styles.img} />
                            <h5 className="card-title">Bodega 2</h5>
                                <p className={styles.p}>Bodega destinada al almacenamiento y organización de los productos, listos para su gestión.
                                </p>
                                <a href="#" className={styles.btn}>Bodega 2</a>
                            </div>
                            {/*Tarjeta numero 3  de la bodega de chile express*/}
                            <div className={styles.card}>
                            <img src="/assets/img/mercado_libre.webp" className={styles.img} />
                            <h5 className="card-title">Bodega 3</h5>
                                <p className={styles.p}>Bodega destinada al almacenamiento y organización de los productos, listos para su gestión.
                                </p>
                                <a href="#" className={styles.btn}>Bodega 3</a>
                            </div>
                            <div className={styles.card}>
                            <img src="/assets/img/mercado_libre.webp" className={styles.img} />
                            <h5 className="card-title">Bodega 4</h5>
                                <p className={styles.p}>Bodega destinada al almacenamiento y organización de los productos, listos para su gestión.
                                </p>
                                <a href="#" className={styles.btn}>Bodega 4</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBodega;