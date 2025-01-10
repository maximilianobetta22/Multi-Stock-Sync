import React from 'react';
import styles from './EditarBodega.module.css';

const EditarBodega: React.FC = () => {
    return (
        <div>
            <h1>Editar Bodega</h1>
            <form>
                <div>
                    <label htmlFor="name">Nombre:</label>
                    <input type="text" id="name" name="name" />
                </div>
                <div>
                    <label htmlFor="location">Ubicación:</label>
                    <input type="text" id="location" name="location" />
                </div>
                <button type="submit">Guardar</button>
            </form>
        </div>
    );
};

export default EditarBodega;