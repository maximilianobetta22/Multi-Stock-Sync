import React from "react";

const ReporteRecepcion:React.FC = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
            <h2 className="text-lg font-semibold mb-4">REPORTE DISPONIBLE POR RECEPCIÓN</h2>
            
            <div className="d-flex gap-2 mb-5">
                <input type="text" placeholder="Conexión/Sucursal" className="form-control text-dark" />
                <input type="text" placeholder="Producto a Revisar" className="form-control text-dark" />
                <input type="date" className="form-control text-dark bg-warning text-white" />
                <button className="btn btn-primary">Buscar</button>
            </div>
        
            <div className="bg-light p-4 rounded w-100 max-w-4xl">
                <h3 className="text-md font-semibold border-bottom pb-3 mb-4">Reporte de recepción</h3>
                <div className="table-responsive mt-4">
                <table className="table table-bordered table-striped">
                    <thead className="table-secondary">
                    <tr>
                        <th>N_Documento</th>
                        <th>Fecha</th>
                        <th>Cantidad recepcionada</th>
                        <th>Cantidad Disponible</th>
                        <th>Costo neto</th>
                        <th>Valor total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {[...Array(3)].map((_, index) => (
                        <tr key={index}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
        );
    };
    
export default ReporteRecepcion;