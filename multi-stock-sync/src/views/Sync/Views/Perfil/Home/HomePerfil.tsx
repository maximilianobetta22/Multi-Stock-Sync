import React from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from "./Perfil.module.css";


const HomePerfil: React.FC = () => {
    
    return (
    <div className={`${styles.main} container mt-4`}>
        {/* Encabezado */}
            <header className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold">Perfil de Conexiones</h1>
            <button className="btn btn-primary">Agregar Conexión</button>
            </header>
        {/* Filtro de Fecha */}
            <section className="mb-4">
            <label htmlFor="datePicker" className="form-label">
                Filtrar por Fecha:
            </label>
            <DatePicker
                id="datePicker"
                className="form-control"
                placeholderText="Selecciona una fecha"
            />
            </section>
        {/* Tabla de Conexiones */}
            <section>
            <table className="table table-striped table-hover">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Fecha de Inicio</th>
                    <th>Fecha Actualizada</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {/* Filas de ejemplo */}
                <tr>
                    <td>1</td>
                    <td>Juan Pérez</td>
                    <td>2025-01-01</td>
                    <td>2025-01-05</td>
                    <td>
                    <button className="btn btn-warning btn-sm me-2">Editar</button>
                    <button className="btn btn-danger btn-sm">Eliminar</button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>María Gómez</td>
                    <td>2025-01-02</td>
                    <td>2025-01-06</td>
                    <td>
                        <button className="btn btn-warning btn-sm me-2">Editar</button>
                        <button className="btn btn-danger btn-sm">Eliminar</button>
                    </td>
                </tr>
                </tbody>
            </table>
            </section>
        </div>
    );
};
export default HomePerfil;