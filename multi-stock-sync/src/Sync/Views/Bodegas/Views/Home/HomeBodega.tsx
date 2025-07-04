import { useState, useEffect } from "react";
import styles from "./HomeBodega.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faMapPin,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Warehouse } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";
import DropdownFilter from "../../Components/DropdownFilterBodega";
import { DrawerCreateWarehouse } from "../../Components/DrawerCreateWarehouse";
import { message } from "antd";
import axiosInstance from "../../../../../axiosConfig";

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const roleId = user?.role_id;

const HomeBodega = () => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const {
    fetchWarehouses,
    warehouses,
    loading,
    error,
    deleteWarehouse,
  } = useWarehouseManagement();

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<{ name: string; location: string }>({
    name: "",
    location: "",
  });

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    let filtered = warehouses;

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

  const companyOptions = [
    { value: "", label: "Todas" },
    ...Array.from(new Set(warehouses.map((w) => w.company?.name || "")))
      .filter((name) => name)
      .map((company) => ({
        value: company,
        label: company,
      })),
  ];

  const sortOptions = [
    { value: "", label: "Sin ordenar" },
    { value: "asc", label: "Ascendente" },
    { value: "desc", label: "Descendente" },
  ];

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null) return;
    await deleteWarehouse(String(pendingDeleteId));
    setPendingDeleteId(null);
  };

  const cancelDelete = () => setPendingDeleteId(null);

  const startEditing = (warehouse: Warehouse) => {
    setEditingWarehouseId(warehouse.id);
    setEditedData({ name: warehouse.name, location: warehouse.location });
  };

  const saveEditedWarehouse = async () => {
    if (editingWarehouseId === null) return;

    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/warehouses/${editingWarehouseId}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setEditingWarehouseId(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error al editar la bodega:", error);
      messageApi.open({
        type: "error",
        content: "No se pudo actualizar la bodega.",
      });
    }
  };

  useEffect(() => {
    if (error) {
      messageApi.open({
        type: "error",
        content: `Error: ${error}`,
      });
    } else if (filteredWarehouses.length === 0) {
      messageApi.open({
        type: "error",
        content: "No hay almacenes disponibles",
      });
    }
  }, [error, filteredWarehouses]);

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  return (
    <div className="container-fluid bg-body-tertiary h-100">
      {contextHolder}
      <h1 className={styles.title}>Lista de bodegas</h1>
      <div className={styles.menu}>
        <DropdownFilter
          id="companyFilter"
          label="Filtrar por compañía:"
          value={companyFilter}
          options={companyOptions}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
        <DropdownFilter
          id="sortOrder"
          label="Ordenar por fecha de creación:"
          value={sortOrder}
          options={sortOptions}
          onChange={(e) => setSortOrder(e.target.value)}
        />
        <DrawerCreateWarehouse onWarehouseCreated={fetchWarehouses} />
      </div>

      <div className={styles.bodegas_box}>
        {filteredWarehouses.map((warehouse) => (
          <div className={styles.bodega_item} key={warehouse.id}>
            {editingWarehouseId === warehouse.id ? (
              <div className={styles.bodega_item_link}>
                <input
                  className={styles.input_edit}
                  value={editedData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  placeholder="Nombre"
                />
                <input
                  className={styles.input_edit}
                  value={editedData.location}
                  onChange={(e) =>
                    setEditedData({ ...editedData, location: e.target.value })
                  }
                  placeholder="Ubicación"
                />
                <div className={styles.button_group}>
                  <button onClick={saveEditedWarehouse} className={styles.confirm_yes}>
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingWarehouseId(null)}
                    className={styles.confirm_no}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to={`../DetalleBodega/${warehouse.id}`}
                  className={styles.bodega_item_link}
                >
                  <div className={styles.bodega_item_bg}></div>
                  <div className={styles.bodega_item_title}>
                    <FontAwesomeIcon icon={faWarehouse} /> {warehouse.name}
                  </div>
                  <div className={styles.bodega_item_date_box}>
                    <FontAwesomeIcon icon={faCalendarPlus} /> Actualizado:{" "}
                    <span className={styles.bodega_item_date}>
                      {new Date(warehouse.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.bodega_item_date_box}>
                    <FontAwesomeIcon icon={faMapPin} /> Ubicación:{" "}
                    <span className={styles.bodega_item_date}>
                      {warehouse.location}
                    </span>
                  </div>
                  <div className={styles.bodega_item_date_box}>
                    <FontAwesomeIcon icon={faWarehouse} /> Compañía:{" "}
                    <span className={styles.bodega_item_date}>
                      {warehouse.company?.name || "Sin asignar"}
                    </span>
                  </div>
                </Link>

                {pendingDeleteId === warehouse.id ? (
                  <div className={styles.confirm_box}>
                    <p>¿Estás seguro de que querés eliminar esta bodega?</p>
                    <button
                      onClick={handleDeleteConfirm}
                      className={styles.confirm_yes}
                    >
                      Sí
                    </button>
                    <button onClick={cancelDelete} className={styles.confirm_no}>
                      No
                    </button>
                  </div>
                ) : (
                  <div className={styles.button_group}>
    {![3, 5, 6, 8, 9].includes(roleId) && (
  pendingDeleteId === warehouse.id ? (
    <div className={styles.confirm_box}>
      <p>¿Estás seguro de que querés eliminar esta bodega?</p>
      <button
        onClick={handleDeleteConfirm}
        className={styles.confirm_yes}
      >
        Sí
      </button>
      <button onClick={cancelDelete} className={styles.confirm_no}>
        No
      </button>
    </div>
  ) : (
    <div className={styles.button_group}>
      <button
        className={styles.edit_button}
        onClick={() => startEditing(warehouse)}
      >
        ✏️ Editar
      </button>
      <button
        className={styles.delete_button}
        onClick={() => setPendingDeleteId(warehouse.id)}
      >
        🗑 Eliminar
      </button>
    </div>
  )
)}


                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeBodega;
