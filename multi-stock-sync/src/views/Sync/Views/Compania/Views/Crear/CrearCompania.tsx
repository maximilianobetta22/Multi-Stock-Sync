import React, { useState } from "react";
import styles from "./CrearCompania.module.css";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
import { Link } from "react-router-dom";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";

const CrearCompania: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        setError(null);
      } else {
        setError(data.message || "Error al crear la compañía");
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un problema inesperado. Inténtalo de nuevo.");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className={`container-fluid mt-2 ${styles.main}`}>
      <h1 className={`mt-2 ${styles.header}`}>Crear Compañía</h1>
      <p>En este apartado puedes crear una nueva compañía.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label htmlFor="name">Nombre de la compañía:</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className="btn btn-primary mt-3">Crear Compañía</button>
        </div>
      </form>

      {showToast && (
        <ToastComponent
          message={error ? `Error: ${error}` : "Compañía creada exitosamente"}
          type={error ? "danger" : "success"}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="d-flex justify-content-center mt-3">
        <Link to={"/sync/companias/home"} className="btn btn-secondary">Volver a inicio</Link>
      </div>
    </div>
    
  );
};

export default CrearCompania;
