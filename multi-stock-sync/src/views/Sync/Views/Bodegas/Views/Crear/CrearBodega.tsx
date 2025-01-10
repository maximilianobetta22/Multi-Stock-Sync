import React from 'react';
import styles from './EditarBodega.module.css';

const CrearBodega: React.FC = () => {
    return (
        <div>
            <h1>Crear Bodega</h1>
            <form>
                <div>
                    <label htmlFor="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" />
                </div>
                <div>
                    <label htmlFor="direccion">Dirección:</label>
                    <input type="text" id="direccion" name="direccion" />
                </div>
                <div>
                    <label htmlFor="telefono">Teléfono:</label>
                    <input type="text" id="telefono" name="telefono" />
                </div>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
};

export default CrearBodega;