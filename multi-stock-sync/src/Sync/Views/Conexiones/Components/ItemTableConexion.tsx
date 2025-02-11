import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { SyncData } from '../interface';
import { useState} from 'react';
import styles from "../Views/ListConexiones/ListConexiones.module.css";

interface props {
  conexion: SyncData;
  loadingRowId: number | null;
  copyToClipboard: (token: string, message: string) => void;
  confirmDisconnect: (clientId: string, rowId: number) => void;
  testConnection: (clientId: string) => void;
}

export const ItemTableConexion = ({
  conexion,
  loadingRowId,
  copyToClipboard,
  confirmDisconnect,
  testConnection }: props
) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    console.log(isOpen);
  }

  const noImageSrc = "/assets/img/no_image.jpg";

  return (
    <tr key={conexion.id} className={loadingRowId === conexion.id ? "table-warning" : styles.tBody__row}>
      <td className={styles.rowBody__item1}>{conexion.id}</td>
      <td className={styles.rowBody__item2}>
        <img
          src={conexion.profile_image || noImageSrc}
          alt="Profile"
          width="50"
          height="50"
          style={{ objectFit: "cover" }}
        />
      </td>
      <td className={styles.rowBody__item3}>{conexion.client_id}</td>
      <td className={styles.rowBody__item4}>{conexion.nickname}</td>
      <td className={styles.rowBody__item5}>{conexion.email}</td>
      <td className={styles.rowBody__item6}>{new Date(conexion.updated_at).toLocaleString()}</td>
      <td className={styles.rowBody__item7}>
        <button
          className={styles.item7__btn}
          onClick={handleMenuToggle}
        >
          <FontAwesomeIcon className={styles.btn__icon} icon={faEllipsisV} />
        </button>
        <ul className={`${styles.dropdown} ${(isOpen) ? styles.dropdownOpen : ''}`}>
          <li>
            <button
              className={styles.dropdown__item}
              onClick={() => copyToClipboard(conexion.access_token, "Token copiado al portapapeles!")}
            >
              Copiar Tóken Secreto
            </button>
          </li>
          <li>
            <button
              className={styles.dropdown__item}
              onClick={() => testConnection(conexion.client_id)}
            >
              Refrescar Conexión
            </button>
          </li>
          <li>
            <button
              className={styles.dropdown__item}
              onClick={() => confirmDisconnect(conexion.client_id, conexion.id)}
            >
              Eliminar Conexión
            </button>
          </li>
        </ul>
      </td>
    </tr>
  );
};