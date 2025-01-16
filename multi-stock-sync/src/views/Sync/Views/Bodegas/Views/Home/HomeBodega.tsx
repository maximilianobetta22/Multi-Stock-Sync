import { useState, useEffect } from "react";
import styles from "./HomeBodega.module.css";

const HomeBodega = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setShowToast(false);
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/warehousesAttachment`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setWarehouses(data);
          if (data.length === 0) {
            setShowToast(true);
          }
        } else {
          setError(data.message || "Error al obtener los almacenes");
          setShowToast(true);
        }
      } catch (err) {
        console.error(err);
        setError(" Ocurrió un problema inesperado. Inténtalo de nuevo.");
        setShowToast(true);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid">
        <h1 className={styles.h1}>Home Bodega</h1>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {warehouses.length > 0 ? (
            warehouses.map((warehouse: any) => (
              <div className="col" key={warehouse.id}>
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
                        <h5 className="card-title">{warehouse.name}</h5>
                        <p className={`${styles.paragraphStyle}`}>
                          Ubicación: {warehouse.location}
                        </p>
                        <p className={`${styles.paragraphStyle}`}>
                          Actualizado:{" "}
                          {new Date(warehouse.updated_at).toLocaleDateString()}
                        </p>
                        <button className={`${styles.goButton} btn mt-2`}>
                          Ir a Bodega
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
