import { useState, useEffect } from "react";
import styles from "./HomeBodega.module.css";

const HomeBodega = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setShowToast(false);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/warehouses`
        );
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("La respuesta no es JSON");
        }

        const data = await response.json();
        if (data.length === 0) {
          setShowToast(true);
        }
        setWarehouses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setShowToast(true);
      }
    };

    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div>
      <div className="container-fluid">
        <h1 className={styles.h1}>Home Bodega</h1>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {warehouses.length > 0 ? (
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
          ) : (
            <p className="mt-3 text-muted">No hay almacenes disponibles.</p>
          )}
        </div>
        {/*Toast */}
        <div
          id="liveToast"
          className={`toast position-fixed bottom-0 mb-2 ms-2 end-0 p-1 ${
            showToast ? " show" : " hide"
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">MultiStockSync</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body">
            {error ? `Error: ${error}` : "No hay almacenes disponibles"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBodega;
