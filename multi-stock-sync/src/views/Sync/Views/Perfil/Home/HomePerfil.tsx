import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Link } from "react-router-dom";
import styles from "./Perfil.module.css";
import axios from "axios";
import ToastComponent from "../../../Components/ToastComponent/ToastComponent";

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

const HomePerfil: React.FC = () => {
    const [conexiones, setConexiones] = useState<SyncData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | null>(null);
    const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`;
    const noImageSrc = "/assets/img/no_image.jpg";

    const copyToClipboard = (token: string, message: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(token).then(() => {
                setToastMessage(message);
                setToastType('success');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setToastMessage(null);
                    setToastType(null);
                }, 2000);
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
                setToastMessage(message);
                setToastType('success');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setToastMessage(null);
                    setToastType(null);
                }, 2000);
            } catch (err) {
                console.error("Error al copiar el token:", err);
            }
            document.body.removeChild(textArea);
        }
    };

    const openToast = (clientId: string) => {
        setSelectedClientId(clientId);
        setShowToast(true);
    };

    const closeToast = () => {
        setShowToast(false);
        setSelectedClientId(null);
    };

    const disconnectConexion = async () => {
        if (!selectedClientId) return;
        const url = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${selectedClientId}`;
        try {
            const response = await axios.delete(url);
            if (response.data.status === "success") {
                setConexiones(conexiones.filter(conexion => conexion.client_id !== selectedClientId));
                setToastMessage("Conexión desconectada exitosamente");
                setToastType('success');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setToastMessage(null);
                    setToastType(null);
                }, 2000);
                setLoading(true);
                window.location.reload();
            } else {
                setToastMessage("Error al desconectar la conexión");
                setToastType('error');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setToastMessage(null);
                    setToastType(null);
                }, 2000);
                console.error("Error en la respuesta de la API:", response.data);
            }
        } catch (error) {
            console.error("Error al desconectar la conexión:", error);
            setToastMessage("Error al desconectar la conexión");
            setToastType('error');
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(null);
                setToastType(null);
            }, 2000);
        } finally {
            closeToast();
        }
    };

    const testConnection = async (clientId: string) => {
        const url = `${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${clientId}`;
        try {
            const response = await axios.get(url);
            if (response.data.status === "success") {
                setToastMessage(`${response.data.message}`);
                setToastType('success');
            } else {
                setToastMessage(`Error en la conexión: ${response.data.message}`);
                setToastType('error');
            }
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(null);
                setToastType(null);
            }, 2000);
        } catch (error) {
            console.error("Error al probar la conexión:", error);
            setToastMessage("Ocurrió un error al intentar probar la conexión.");
            setToastType('error');
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(null);
                setToastType(null);
            }, 2000);
        }
    };

    useEffect(() => {
        const fetchConexiones = async () => {
            try {
                const response = await axios.get(API_URL);
                if (response.data.status === "success") {
                    setConexiones(response.data.data);
                } else {
                    console.error("Error en la respuesta de la API:", response.data);
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
                        <Link to="/sync/loginmercadolibre" className="btn btn-primary">Agregar Conexiones</Link>
                        <Link to="/" className="btn btn-secondary ms-2 mt-3">Volver al Inicio</Link>
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
                                        <tr key={conexion.id}>
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
                                                ...
                                                </button>
                                                <ul className="dropdown-menu" aria-labelledby={`dropdown-${conexion.id}`}>
                                                <li>
                                                    <button
                                                    className="dropdown-item"
                                                    onClick={() => copyToClipboard(conexion.access_token, "Token copiado al portapapeles!")}
                                                    >
                                                    Copiar
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                    className="dropdown-item text-success"
                                                    onClick={() => testConnection(conexion.client_id)}
                                                    >
                                                    Probar Conexión
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                    className="dropdown-item text-danger"
                                                    onClick={() => openToast(conexion.client_id)}
                                                    >
                                                    Desconectar
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
                                    <Link to="/sync/loginmercadolibre" className="btn btn-primary">Agregar Conexiones</Link>
                                    <Link to="/" className="btn btn-secondary ms-2">Volver al Inicio</Link>
                                </div>
                        </div>
                    </div>
                )}
            </div>
            

            {showToast && (
                <ToastComponent
                    message={toastMessage || "¿Está seguro que desea desconectar esta conexión?"}
                    type={toastType === 'success' ? 'success' : 'danger'}
                    onClose={closeToast}
                    onConfirm={!toastMessage ? disconnectConexion : undefined}
                    onCancel={!toastMessage ? closeToast : undefined}
                />
            )}
        </div>
    );
};

export default HomePerfil;
