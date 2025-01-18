import { useState, useEffect } from "react";
import styles from "./HomeBodega.module.css";
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

interface Warehouse {
  id: number;
  name: string;
  location: string;
  assigned_company_id: number;
  created_at: string;
  updated_at: string;
  company: Company;
}

const HomeBodega = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  useEffect(() => {
    const fetchWarehouses = async () => {
      setShowToast(false);
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/warehouses`);

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
    let filtered = warehouses;

    if (companyFilter) {
      filtered = filtered.filter(
        (warehouse) => warehouse.company.name === companyFilter
      );
    }

    if (sortOrder === "asc") {
      filtered = filtered.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortOrder === "desc") {
      filtered = filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredWarehouses(filtered);
  }, [warehouses, companyFilter, sortOrder]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleCompanyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompanyFilter(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  if (loading) {
    return (
      <LoadingDinamico variant="container" />
    );
  }

  return (
    <div>
      <div className="container-fluid">
        <h1 className="mt-2">Lista de bodegas</h1>
        <p>En este apartado puedes ver la lista de todas las bodegas registradas en el sistema, puedes filtrarlas por compañías u ordenarlas!</p>

        <div className={styles.menu}>
          <div className={styles.filter}>
            <label htmlFor="companyFilter">Filtrar por compañía:</label>
            <select id="companyFilter" value={companyFilter} onChange={handleCompanyFilterChange}>
              <option value="">Todas</option>
              {Array.from(new Set(warehouses.map((w) => w.company.name))).map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
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
                <th className="table_header">Nombre</th>
                <th className="table_header">Ubicación</th>
                <th className="table_header">Compañía/Empresa asignada</th>
                <th className="table_header">Última actualización</th>
                <th className="table_header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td>{warehouse.name}</td>
                    <td>{warehouse.location}</td>
                    <td>{warehouse.company.name}</td>
                    <td>{new Date(warehouse.updated_at).toLocaleDateString()}</td>
                    <td>
                    <Link to={`../DetalleBodega/${warehouse.id}`} className={`${styles.goButton} btn mx-1`}>Ir a Bodega</Link>
                    <Link to={`../editar/${warehouse.id}`} className={`${styles.goButton} btn`}>Editar bodega</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-muted">No hay almacenes disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showToast && (
          <ToastComponent
            message={error ? `Error: ${error}` : "No hay almacenes disponibles"}
            type={error ? "danger" : "success"}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default HomeBodega;
