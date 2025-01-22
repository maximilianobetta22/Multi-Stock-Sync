import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
import { Link } from "react-router-dom";
import styles from "./ListConexiones.module.css";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface SyncData {
    id: number;
    client_id: string;
    client_secret: string;
    access_token: string;
    refresh_token: string;
    expires_at: string;
    nickname: string;
    email: string;
    profile_image: string | null;
    created_at: string;
    updated_at: string;
}

const ListConexiones: React.FC = () => {
    const [conexiones, setConexiones] = useState<SyncData[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRowId, setLoadingRowId] = useState<number | null>(null);
    const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`;
    const noImageSrc = "/assets/img/no_image.jpg";

    const copyToClipboard = (token: string, message: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(token).then(() => {
                MySwal.fire({
                    title: 'Éxito',
                    text: message,
                    icon: 'success'
                });
            }).catch(err => console.error("Error al copiar el token:", err));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = token;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                MySwal.fire({
                    title: 'Éxito',
                    text: message,
                    icon: 'success'
                });
            } catch (err) {
                console.error("Error al copiar el token:", err);
            }
            document.body.removeChild(textArea);
        }
    };

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
        <div className={styles.main}>
            <div>
                <h1>Lista de conexiones a MercadoLibre</h1>

                {conexiones.length === 0 ? (
                    <div className={styles.noConexiones}>
                        <img src="/assets/img/icons/link_notfound.svg" alt="No Connections" />
                        <strong className="mb-5">No se han encontrado conexiones guardadas en el sistema, por favor, cree una nueva conexión.</strong>
                        <Link to="/sync/conexiones/login" className="btn btn-primary">Agregar Conexiones</Link>
                        <Link to="/sync/home" className="btn btn-secondary ms-2 mt-3">Volver al Inicio</Link>
                    </div>
                ) : (
                    <div>
                        <div className={styles.main}>
                            <div className={styles.tablaWrapper}>
                                <table className="table table-light table-hover">
                                    <thead>
                                        <tr>
                                            <th className="table_header">ID</th>
                                            <th className="table_header">Imagen</th>
                                            <th className="table_header">Cliente</th>
                                            <th className="table_header">Nickname</th>
                                            <th className="table_header">Email</th>
                                            <th className="table_header">Última Actualización</th>
                                            <th className="table_header">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conexiones.map((conexion) => (
                                            <tr key={conexion.id} className={loadingRowId === conexion.id ? "table-warning" : ""}>
                                                <td>{conexion.id}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <img
                                                        src={conexion.profile_image || noImageSrc}
                                                        alt="Profile"
                                                        width="50"
                                                        height="50"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </td>
                                                <td>{conexion.client_id}</td>
                                                <td>{conexion.nickname}</td>
                                                <td>{conexion.email}</td>
                                                <td>{new Date(conexion.updated_at).toLocaleString()}</td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn"
                                                            style={{ border: "none", background: "transparent" }}
                                                            type="button"
                                                            id={`dropdown-${conexion.id}`}
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            <FontAwesomeIcon icon={faEllipsisV} />
                                                        </button>
                                                        <ul className="dropdown-menu" aria-labelledby={`dropdown-${conexion.id}`}>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => copyToClipboard(conexion.access_token, "Token copiado al portapapeles!")}
                                                                >
                                                                    Copiar Tóken Secreto
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => testConnection(conexion.client_id)}
                                                                >
                                                                    Refrescar Conexión
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => confirmDisconnect(conexion.client_id, conexion.id)} 
                                                                >
                                                                    Eliminar Conexión
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-end mt-5" style={{ marginTop: "auto" }}>
                                <Link to="/sync/conexiones/login" className="btn btn-primary">Agregar Conexiones</Link>
                                <Link to="/sync/home" className="btn btn-secondary ms-2">Volver al Inicio</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListConexiones;
