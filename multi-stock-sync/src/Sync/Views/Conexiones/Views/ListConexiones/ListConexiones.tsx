import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import styles from "./ListConexiones.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { ItemTableConexion } from "../../Components/ItemTableConexion";
import { SyncData } from "../../interface";
import { copyToClipboard } from "../../helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
const MySwal = withReactContent(Swal);

const ListConexiones: React.FC = () => {
  const [conexiones, setConexiones] = useState<SyncData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);
  const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`;

  const confirmDisconnect = async (clientId: string, rowId: number) => {
    const result = await MySwal.fire({
      title: '¿Está seguro que desea desconectar esta conexión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desconectar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setLoadingRowId(rowId);
      await disconnectConexion(clientId);
    }
  };

  const disconnectConexion = async (clientId: string) => {
    if (!clientId) return;
    const url = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${clientId}`;
    MySwal.fire({
      title: 'Desconectando',
      text: 'Por favor, espere mientras se desconecta la conexión...',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false
    });

    try {
      const response = await axios.delete(url);
      if (response.data.status === "success") {
        setConexiones(conexiones.filter(conexion => conexion.client_id !== clientId));
        await MySwal.fire({
          title: 'Éxito',
          text: response.data.message,
          icon: 'success'
        });
      } else {
        await MySwal.fire({
          title: 'Error',
          text: response.data.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error("Error al desconectar la conexión:", error);
      await MySwal.fire({
        title: 'Error',
        text: 'Error al desconectar la conexión',
        icon: 'error'
      });
    } finally {
      setLoadingRowId(null);
      setLoading(true);
      window.location.reload();
    }
  };

  const testConnection = async (clientId: string) => {
    const url = `${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${clientId}`;
    MySwal.fire({
      title: 'Refrescar Conexión',
      text: 'Refrescando la conexión...',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false
    });
    try {
      const response = await axios.get(url);
      if (response.data.status === "success") {
        MySwal.fire({
          title: 'Éxito',
          text: response.data.message,
          icon: 'success'
        });
      } else {
        MySwal.fire({
          title: 'Error',
          text: `Error en la conexión: ${response.data.message}`,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error("Error al probar la conexión:", error);
      MySwal.fire({
        title: 'Error',
        text: 'Ocurrió un error al intentar probar la conexión.',
        icon: 'error'
      });
    }
  };

  useEffect(() => {
    const fetchConexiones = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.status === "success") {
          setConexiones(response.data.data);
        }
      } catch (error) {
        console.error("Error al obtener conexiones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConexiones();
  }, []);

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className={styles.main__container}>
      <header className={styles.container__header}>
        <h1 className={styles.header__title}>Lista de conexiones a MercadoLibre</h1>
      </header>
      {conexiones.length === 0 ? (
        <div className={styles.container__table}>
          <img src="/assets/img/icons/link_notfound.svg" alt="No Connections" />
          <strong className="mb-5">No se han encontrado conexiones guardadas en el sistema, por favor, cree una nueva conexión.</strong>
        </div>
      ) : (
        <div className={styles.container__table}>
          <table className={styles.table}>
            <thead className={styles.table__tHead}>
              <tr className={styles.tHead__row}>
                <th className={styles.rowHead__item1}>ID</th>
                <th className={styles.rowHead__item2}>IMG</th>
                <th className={styles.rowHead__item3}>CLIENTE</th>
                <th className={styles.rowHead__item4}>NOMBRE</th>
                <th className={styles.rowHead__item5}>EMAIL</th>
                <th className={styles.rowHead__item6}>Última Actualización</th>
                <th className={styles.rowHead__item7}>
                  <FontAwesomeIcon className={styles.item__icon} icon={faList}/>
                </th>
              </tr>
            </thead>
            <tbody className={styles.table__tBody}>
              {conexiones.map((conexion) => (
                <ItemTableConexion
                  key={conexion.id}
                  conexion={conexion}
                  loadingRowId={loadingRowId}
                  copyToClipboard={copyToClipboard}
                  confirmDisconnect={confirmDisconnect}
                  testConnection={testConnection}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <footer className={styles.container__footer}>
        <Link to="/sync/conexiones/login" className="btn btn-primary">Agregar Conexiones</Link>
        <Link to="/sync/home" className="btn btn-secondary ms-2">Volver al Inicio</Link>
      </footer>
    </div>
  );
};

export default ListConexiones;
