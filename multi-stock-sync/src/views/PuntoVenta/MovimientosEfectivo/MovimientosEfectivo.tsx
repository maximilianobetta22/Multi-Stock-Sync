import React from 'react';
import './MovimientosEfectivo.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';

const MovimientoForm: React.FC = () => {
    const [formData, setFormData] = React.useState({
        sucursal: "Casa Matriz",
        fechaMovimiento: new Date().toISOString().split("T")[0],
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
        <form
            onSubmit={handleSubmit}
            style={{
                width: "600px",
                margin: "0 auto",
                border: "1px solid #ccc",
                padding: "1rem",
            }}
        >
            <div style={{ marginBottom: "1rem" }}>
                <label>Sucursal:</label>
                <p
                    style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                    }}
                >
                    {formData.sucursal}
                </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Fecha Movimiento:</label>
                <input
                    type="date"
                    name="fechaMovimiento"
                    value={formData.fechaMovimiento}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        border: "1px solid #ccc",
                        outline: "none",
                    }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Tipo de Movimiento:</label>
                <select
                    name="tipoMovimiento"
                    value={formData.tipoMovimiento}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        border: "1px solid #ccc",
                        outline: "none",
                    }}
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
                    value={formData.montoMovimiento || ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || parseFloat(value) > 0) {
                            handleChange(e);
                        }
                    }}
                    placeholder="$ 0"
                    style={{
                        width: "100%",
                        border: "1px solid #ccc",
                        outline: "none",
                        appearance: "none",
                        MozAppearance: "textfield",
                        WebkitAppearance: "none",
                        paddingLeft: "0.5rem",
                        color: formData.montoMovimiento ? "#000" : "rgba(0, 0, 0, 0.5)",
                    }}
                    min="0"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>Observación:</label>
                <textarea
                    name="observacion"
                    value={formData.observacion}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        border: "1px solid #ccc",
                        outline: "none",
                    }}
                />
            </div>

            <button
                className='button-orange'
                type="submit"
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                }}
            >
                Guardar
            </button>
        </form>
    );
};

const FiltrarPorFecha: React.FC = () => {
    const [fechaFiltro, setFechaFiltro] = React.useState(new Date().toISOString().split("T")[0]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFechaFiltro(e.target.value);
    };

    return (
        <div
            style={{
                border: "1px solid #ccc",
                padding: "1rem",
                width: "400px",
                backgroundColor: "#fff",
                borderRadius: "4px",
            }}
        >
            <h3>$ Movimientos Disponibles</h3>
            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        borderRadius: "4px",
                    }}
                />
            </div>
            <p>Sin Registros</p>
        </div>
    );
};

const MovimientosEfectivo: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-50 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <MovimientoForm />
                    </div>
                </div>
                <div className="w-50 custom-gray p-3 d-flex align-items-center justify-content-center">
                    <FiltrarPorFecha />
                </div>
            </div>
        </>
    );
};

export default MovimientosEfectivo;
