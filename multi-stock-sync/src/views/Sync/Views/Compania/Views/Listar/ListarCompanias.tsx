import React, { useState, useEffect } from "react";
import styles from "./ListarCompanias.module.css";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const ListarCompanias: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setShowToast(false);
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`);

        const data = await response.json();

        if (response.ok) {
          setCompanies(data);
          if (data.length === 0) {
            setShowToast(true);
          }
        } else {
          setError(data.message || "Error al obtener las compañías");
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

    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    if (sortOrder === "asc") {
      filtered = filtered.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortOrder === "desc") {
      filtered = filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, sortOrder]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  if (loading) {
    return (
      <LoadingDinamico variant="container" />
    );
  }

  return (
    <div className="container-fluid mt-2">
      <h1 className="mt-2">Lista de compañías</h1>
      <p>En este apartado puedes ver la lista de todas las compañías registradas en el sistema.</p>

      {filteredCompanies.length > 0 ? (
        <>
          <div className={styles.menu}>
            <div className={styles.filter}>
              <label htmlFor="sortOrder">Ordenar por fecha de creación:</label>
              <select id="sortOrder" value={sortOrder} onChange={handleSortOrderChange}>
                <option value="">Sin ordenar</option>
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
            <Link to="../crear" className={styles.btn__add}>
              <FontAwesomeIcon className={styles.icon__add} icon={faPlus}/>
            </Link>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className="table_header">ID</th>
                  <th className="table_header">Nombre</th>
                  <th className="table_header">Fecha de creación</th>
                  <th className="table_header">Última actualización</th>
                  <th className="table_header">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{new Date(company.created_at).toLocaleDateString()}</td>
                    <td>{new Date(company.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link to={`../DetalleCompania/${company.id}`} className={`btn btn-success mb-2`}>Ir a Compañía</Link>
                        <Link to={`../editar/${company.id}`} className={`btn btn-primary`}>Editar compañía</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className={styles.noCompanies}>
          <img src="/assets/img/icons/product_notfound.svg" alt="No companies available" />
          <p className="text-muted">No hay compañías disponibles.</p>
          <Link to="../crear" className={styles.btn__add}>
            <FontAwesomeIcon className={styles.icon__add} icon={faPlus}/>
          </Link>
        </div>
      )}

      {showToast && (
        <ToastComponent
          message={error ? `Error: ${error}` : "No hay compañías disponibles"}
          type={error ? "danger" : "success"}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="d-flex justify-content-center mt-3">
        <Link to={"/sync/home"} className="btn btn-secondary">Volver a inicio</Link>
      </div>
      
    </div>
  );
};

export default ListarCompanias;