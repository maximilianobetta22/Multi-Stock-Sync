import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { SyncData } from '../interface';
import styles from "../Views/ListConexiones/ListConexiones.module.css";

interface Props {
  conexion: SyncData;
  loadingRowId: number | null;
  copyToClipboard: (token: string, message: string) => void;
  confirmDisconnect: (clientId: string, rowId: number) => void;
  testConnection: (clientId: string) => void;
  isOpen: boolean;
  handleMenuToggle: () => void;
}

const ItemTableConexion: React.FC<Props> = ({
  conexion,
  loadingRowId,
  copyToClipboard,
  confirmDisconnect,
  testConnection,
  isOpen,
  handleMenuToggle
}) => {
  const noImageSrc = "/assets/img/no_image.jpg";

  const handleCopyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(conexion.access_token, "Token copiado al portapapeles!");
    handleMenuToggle();
  };

  const handleTestConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    testConnection(conexion.client_id);
    handleMenuToggle();
  };

  const handleConfirmDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Lógica original mantenida - solo deshabilitada visualmente
    confirmDisconnect(conexion.client_id, conexion.id);
    handleMenuToggle();
  };

  return (
    <tr 
      key={conexion.id} 
      className={`
        ${loadingRowId === conexion.id ? "table-warning" : styles.tBody__row}
        ${isOpen ? styles.dropdownActive : ''}
      `}
    >
      
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

  onClick={(e) => {
    e.stopPropagation();
    handleMenuToggle();
  }}

        >
          <FontAwesomeIcon className={styles.btn__icon} icon={faEllipsisV} />
        </button>
        <ul className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`}>
          <li>
            <button
              className={styles.dropdown__item}
              onClick={handleCopyToClipboard}
            >
              Copiar Tóken Secreto
            </button>
          </li>
          <li>
            <button
              className={styles.dropdown__item}
              onClick={handleTestConnection}
            >
              Refrescar Conexión
            </button>
          </li>
          <li style={{ display: 'none' }}> {/* Para mostrar: cambiar a 'block' */}
            <button
              className={styles.dropdown__item}
              onClick={handleConfirmDisconnect}
            >
              Eliminar Conexión
            </button>
          </li>
        </ul>
      </td>
    </tr>
  );
};

export default ItemTableConexion;