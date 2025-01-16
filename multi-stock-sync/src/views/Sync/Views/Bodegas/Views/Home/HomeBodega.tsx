import styles from "./HomeBodega.module.css";

const HomeBodega = () => {
  return (
    <div className="container-fluid">
      <h1 className={styles.h1}>Home Bodega</h1>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        <div className="col">
          <div className={`card ${styles.cardStyle}`}>
            <div className="row g-0">
              <div className="col-sm-4 p-2">
                <img
                  src="/assets/img/mercado_libre.webp"
                  alt="imgTest"
                  className="img-fluid rounded-start"
                />
              </div>
              <div className="col-sm-8 p-2">
                <div className="card-body">
                  <h5 className="card-title">Bodega 1</h5>
                  <p className={`${styles.paragraphStyle}`}>
                    Ubicación: tu casa
                  </p>
                  <p className={`${styles.paragraphStyle}`}>
                    Actualizado: Data
                  </p>
                  <button className={`${styles.goButton} btn mt-2`}>
                    Ir a Bodega
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBodega;
