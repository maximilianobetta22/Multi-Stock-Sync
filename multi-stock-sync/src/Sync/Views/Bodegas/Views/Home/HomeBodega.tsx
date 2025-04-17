import { useState, useEffect } from "react";
import styles from "./HomeBodega.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Warehouse } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";

const HomeBodega = () => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const { fetchWarehouses, warehouses, loading, error } =
    useWarehouseManagement();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    let filtered = warehouses || [];

    if (companyFilter) {
      filtered = filtered.filter(
        (warehouse) => warehouse.company?.name === companyFilter
      );
    }

    if (sortOrder === "asc") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortOrder === "desc") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredWarehouses(filtered);
  }, [warehouses, companyFilter, sortOrder]);

  useEffect(() => {
    if (error) {
      setShowToast(true);
    }
  }, [error]);

  const handleCompanyFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCompanyFilter(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  return (
    <div>
      <div className="container-fluid bg-body-tertiary">
        <h1 className="mt-2">Lista de bodegas</h1>
        <p>
          En este apartado puedes ver la lista de todas las bodegas registradas
          en el sistema, puedes filtrarlas por compañías u ordenarlas!
        </p>

        <div className={styles.menu}>
          <div className={styles.filter}>
            <label htmlFor="companyFilter">Filtrar por compañía:</label>
            <select
              id="companyFilter"
              value={companyFilter}
              onChange={handleCompanyFilterChange}
            >
              <option value="">Todas</option>
              {Array.from(new Set(warehouses.map((w) => w.company.name))).map(
                (company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="sortOrder">Ordenar por fecha de creación:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleSortOrderChange}
            >
              <option value="">Sin ordenar</option>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
          <Link to="../crear" className={styles.btn__add}>
            <FontAwesomeIcon className={styles.icon__add} icon={faPlus} />
          </Link>
        </div>

        <div className={styles.format_container}>
          {filteredWarehouses.length > 0
            ? filteredWarehouses.map((warehouse) => (
                <div className={styles.bodegas_box}>
                  <div className={styles.bodega_item}>
                    <Link
                      to={`../DetalleBodega/${warehouse.id}`}
                      className={styles.bodega_item_link}
                    >
                      <div className={styles.bodega_item_bg}></div>
                      <div className={styles.bodega_item_title}>
                        {warehouse.name}
                      </div>
                      <div className={styles.bodega_item_date_box}>
                        Actualizado:{" "}
                        <span className={styles.bodega_item_date}>
                          {new Date(warehouse.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))
            : "hello"}
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
