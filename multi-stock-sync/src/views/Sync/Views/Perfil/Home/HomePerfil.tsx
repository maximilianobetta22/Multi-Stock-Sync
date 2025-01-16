import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Link } from "react-router-dom";
import styles from "./Perfil.module.css";
import axios from "axios";


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
    const [loading, setLoading] = useState(true); // Loading state
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`;
    const noImageSrc = "/assets/img/no_image.jpg";

    const truncateToken = (token: string | null) => {
        if (!token) return "";
        return token.length > 10 ? `${token.substring(0, 10)}...` : token;
    };

    const copyToClipboard = (token: string, message: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = token;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setToastMessage(message);
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(null);
            }, 2000);
        } catch (err) {
            console.error("Error al copiar el token:", err);
        }
        document.body.removeChild(textArea);
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
                alert("Conexión desconectada exitosamente");
                setLoading(true);
                window.location.reload();
            } else {
                console.error("Error en la respuesta de la API:", response.data);
            }
        } catch (error) {
            console.error("Error al desconectar la conexión:", error);
        } finally {
            closeToast();
        }
    };

    // Call API data
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
                setLoading(false); // Disable loading
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
                    <div className={`${styles.noConexiones}`}>
                        <strong className="mb-5">No se han encontrado conexiones guardadas en el sistema, por favor, cree una nueva conexión.</strong>
                        <Link to="/sync/loginmercadolibre" className="btn btn-primary">Agregar Conexiones</Link>
                        <Link to="/" className="btn btn-secondary ms-2 mt-3">Volver al Inicio</Link>
                    </div>
                ) : (
                    <div>
                        <div className={styles.tabla}>
                            <table className="table table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Imagen</th>
                                        <th>Cliente</th>
                                        <th>Nickname</th>
                                        <th>Email</th>
                                        <th>Acceso Token</th>
                                        <th>Última Actualización</th>
                                        <th>Acciones</th>
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
                                            <td>
                                                {truncateToken(conexion.access_token)}
                                                <button 
                                                    className="btn btn-secondary btn-sm ms-2" 
                                                    onClick={() => copyToClipboard(conexion.access_token, "Token copiado al portapapeles!")}
                                                >
                                                    Copiar
                                                </button>
                                            </td>
                                            <td>{new Date(conexion.updated_at).toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => openToast(conexion.client_id)}>Desconectar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-end mt-5">
                            <Link to="/sync/loginmercadolibre" className="btn btn-primary">Agregar Conexiones</Link>
                            <Link to="/" className="btn btn-secondary ms-2">Volver al Inicio</Link>
                        </div>
                    </div>
                )}
            </div>
            {showToast && (
                <div className="toast show position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <strong className="me-auto">MultiStock-Sync</strong>
                        <button type="button" className="btn-close" onClick={closeToast}></button>
                    </div>
                    <div className="toast-body">
                        {toastMessage || "¿Está seguro que desea desconectar esta conexión?"}
                        {!toastMessage && (
                            <div className="mt-2 pt-2 border-top">
                                <button className="btn btn-danger btn-sm me-2" onClick={disconnectConexion}>Sí, desconectar</button>
                                <button className="btn btn-secondary btn-sm" onClick={closeToast}>Cancelar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePerfil;
