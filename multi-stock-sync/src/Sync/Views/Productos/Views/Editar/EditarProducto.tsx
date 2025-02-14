import React from 'react';

const EditarProducto: React.FC = () => {
    return (
        <div>
            <h1>Editar Producto</h1>
            <form>
                <div>
                    <label htmlFor="productName">Nombre del Producto:</label>
                    <input type="text" id="productName" name="productName" />
                </div>
                <div>
                    <label htmlFor="productPrice">Precio del Producto:</label>
                    <input type="number" id="productPrice" name="productPrice" />
                </div>
                <div>
                    <label htmlFor="productDescription">Descripción del Producto:</label>
                    <textarea id="productDescription" name="productDescription"></textarea>
                </div>
                <button type="submit">Guardar Cambios</button>
            </form>
        </div>
    );
};

export default EditarProducto;