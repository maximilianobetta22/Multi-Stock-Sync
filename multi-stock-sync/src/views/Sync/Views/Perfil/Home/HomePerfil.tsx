import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Perfil.module.css";
import axios from "axios";

// Interfaz para definir los datos de conexión
interface Conexion {
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
    const [conexiones, setConexiones] = useState<Conexion[]>([]); // Estado para datos de conexión
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Estado para la fecha seleccionada
    const API_URL = "https://linen-anteater-319357.hostingersite.com/api/mercadolibre/credentials";

    // Efecto para cargar los datos de la API
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
            }
        };

        fetchConexiones();
    }, []);

    return (
        <div className={styles.main}>
            <div>
                <h1>Perfil</h1>

                {/* Filtro de fechas */}
                <div className="mb-4">
                    <label htmlFor="datePicker" className="form-label">
                        Filtrar por Fecha:
                    </label>
                    <DatePicker
                        id="datePicker"
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        className="form-control"
                        placeholderText="Selecciona una fecha"
                    />
                </div>

                {/* Tabla de datos */}
                <div className={styles.tabla}>
                    <table className="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Secreto</th>
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
                                    <td>{conexion.client_id}</td>
                                    <td>{conexion.client_secret}</td>
                                    <td>{conexion.email}</td>
                                    <td>{conexion.access_token}</td>
                                    <td>{new Date(conexion.updated_at).toLocaleString()}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm">Desconectar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Botón para agregar conexiones */}
                <div className="text-end mt-3">
                    <button className="btn btn-primary">Agregar Conexiones</button>
                </div>
            </div>
        </div>
    );
};

export default HomePerfil;
