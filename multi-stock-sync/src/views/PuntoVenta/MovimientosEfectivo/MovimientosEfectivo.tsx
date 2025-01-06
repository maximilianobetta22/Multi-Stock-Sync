import React from 'react';
import './MovimientosEfectivo.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';


const MovimientoForm: React.FC = () => {
    const [formData, setFormData] = React.useState({
        sucursal: "Casa Matriz",
        fechaMovimiento: new Date().toISOString().split("T")[0], // Fecha actual
        tipoMovimiento: "saldo de apertura",
        montoMovimiento: 0,
        observacion: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        
        if (name === "montoMovimiento" && Number(value) < 0) {
            return; 
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: "600px", margin: "0 auto", border: "none" }}>
            <div style={{ marginBottom: "1rem" }}>
                <label>Sucursal:</label>
                <p>{formData.sucursal}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Fecha Movimiento:</label>
                <input
                    type="date"
                    name="fechaMovimiento"
                    value={formData.fechaMovimiento}
                    onChange={handleChange}
                    style={{ width: "100%", border: "none", outline: "none" }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Tipo de Movimiento:</label>
                <select
                    name="tipoMovimiento"
                    value={formData.tipoMovimiento}
                    onChange={handleChange}
                    style={{ width: "100%", border: "none", outline: "none" }}
                >
                    <option value="saldo de apertura">Saldo de Apertura</option>
                    <option value="otro movimiento">Otro movimiento</option>
                    <option value="Retiros de efectivo">Retiros de efectivo</option>
                </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Monto Movimiento:</label>
                <input
                    type="number"
                    name="montoMovimiento"
                    value={formData.montoMovimiento}
                    onChange={handleChange}
                    style={{ width: "100%", border: "none", outline: "none" }}
                    min="0"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Observación:</label>
                <textarea
                    name="observacion"
                    value={formData.observacion}
                    onChange={handleChange}
                    style={{ width: "100%", border: "none", outline: "none" }}
                />
            </div>

            <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
                Enviar
            </button>
        </form>
    );
};

const MovimientosEfectivo: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1></h1>
                        <MovimientoForm /> {/* Aquí se coloca el formulario */}
                    </div>
                </div>
                <div className="w-50 custom-gray p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Derecho</h1>
                        <p>Aquí va el contenido principal del lado derecho.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MovimientosEfectivo;