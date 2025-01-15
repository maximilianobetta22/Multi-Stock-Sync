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
    const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`;
    const noImageSrc = "/assets/img/no_image.jpg";

    const truncateToken = (token: string | null) => {
        if (!token) return "";
        return token.length > 10 ? `${token.substring(0, 10)}...` : token;
    };

    const copyToClipboard = (token: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = token;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert("Token copiado al portapapeles");
        } catch (err) {
            console.error("Error al copiar el token:", err);
        }
        document.body.removeChild(textArea);
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
                                            onClick={() => copyToClipboard(conexion.access_token)}
                                        >
                                            Copiar
                                        </button>
                                    </td>
                                    <td>{new Date(conexion.updated_at).toLocaleString()}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm">Desconectar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-end mt-3">
                    <Link to="/sync/loginmercadolibre" className="btn btn-primary">Agregar Conexiones</Link>
                </div>
            </div>
        </div>
    );
};

export default HomePerfil;
