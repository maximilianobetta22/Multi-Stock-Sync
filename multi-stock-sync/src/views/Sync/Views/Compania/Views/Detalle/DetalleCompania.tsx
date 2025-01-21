import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./DetalleCompania.module.css";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import { Link } from "react-router-dom";

interface Warehouse {
  id: number;
  name: string;
  location: string;
  assigned_company_id: number;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  warehouses: Warehouse[];
}

const DetalleCompania: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setShowToast(false);
      setLoading(true);
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/companies/${id}`;
        console.log("API URL:", apiUrl);
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Fetched data:", data);

        if (response.ok) {
          setCompany(data.data); // Update this line to use data.data
        } else {
          setError(data.message || "Error al obtener la compañía");
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

    fetchCompany();
  }, [id]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className="container-fluid">
      <h1 className="mt-2">Detalle de la compañía</h1>
      {company && company.warehouses ? (
        <>
          <div className={styles.detail}>
            <p><strong>ID:</strong> {company.id}</p>
            <p><strong>Nombre:</strong> {company.name}</p>
            <p><strong>Fecha de creación:</strong> {new Date(company.created_at).toLocaleString()}</p>
            <p><strong>Última actualización:</strong> {new Date(company.updated_at).toLocaleString()}</p>
          </div>
          <h2>Bodegas</h2>
          {company.warehouses.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className="table_header">ID</th>
                    <th className="table_header">Nombre</th>
                    <th className="table_header">Ubicación</th>
                    <th className="table_header">Fecha de creación</th>
                    <th className="table_header">Última actualización</th>
                    <th className="table_header">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {company.warehouses.map((warehouse) => (
                    <tr key={warehouse.id}>
                      <td>{warehouse.id}</td>
                      <td>{warehouse.name}</td>
                      <td>{warehouse.location}</td>
                      <td>{new Date(warehouse.created_at).toLocaleString()}</td>
                      <td>{new Date(warehouse.updated_at).toLocaleString()}</td>
                      <td>
                        <Link to={`/sync/bodegas/DetalleBodega/${warehouse.id}`} className="btn btn-primary">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.noWarehousesMessage}>No hay bodegas disponibles.</p>
          )}
        </>
      ) : (
        <p>No se encontró la compañía.</p>
      )}
      {showToast && (
        <ToastComponent
          message={error ? `Error: ${error}` : "No hay compañías disponibles"}
          type={error ? "danger" : "success"}
          onClose={() => setShowToast(false)}
        />
      )}
      <button 
        className="btn btn-secondary mt-3" 
        style={{ float: "right" }}
        onClick={() => window.history.back()}
      >
        Regresar
      </button>
    </div>
  );
};

export default DetalleCompania;
