import React, { useState } from 'react';
import styles from './CrearProducto.module.css';

const CrearProducto: React.FC = () => {
    const [titulo, setTitulo] = useState('');
    const [categorias, setCategorias] = useState<{ id: string, name: string }[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [atributos, setAtributos] = useState<any[]>([]);
    const [producto, setProducto] = useState<any>({});

    const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitulo(e.target.value);
    };

    const buscarCategorias = async () => {
        if (!titulo.trim()) return alert("Por favor, ingresa un título.");
    
        try {
            const SITE_ID = "MLC";
            const url = `https://api.mercadolibre.com/sites/${SITE_ID}/domain_discovery/search?q=${encodeURIComponent(titulo)}`;
            const response = await fetch(url);
            const data = await response.json();
    
            if (data && Array.isArray(data) && data.length > 0) {
                setCategorias(data.map((item: any) => ({
                    id: item.category_id,
                    name: item.category_name,
                })));
            } else {
                setCategorias([]);
                alert("No se encontraron categorías relacionadas.");
            }
        } catch (error) {
            console.error("Error al buscar categorías:", error);
            alert("Hubo un error al buscar categorías.");
        }
    };

    const obtenerAtributosCategoria = async (categoria: string) => {
        try {
            const url = `https://api.mercadolibre.com/categories/${categoria}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.attributes) {
                setAtributos(data.attributes);
            } else {
                setAtributos([]);
                alert("No se encontraron atributos para esta categoría.");
            }
        } catch (error) {
            console.error("Error al obtener atributos:", error);
            alert("Hubo un error al obtener los atributos.");
        }
    };

    const handleCategoriaSeleccionada = (categoria: string) => {
        setCategoriaSeleccionada(categoria);
        setProducto({ titulo, categoria });
        obtenerAtributosCategoria(categoria);
    };

    const handleAtributoChange = (id: string, value: string) => {
        setProducto((prevProducto: any) => ({
            ...prevProducto,
            [id]: value,
        }));
    };

    return (
        <div className={styles.crearProducto}>
            <h1>Crear Producto</h1>

            {/* Step 1: Input searching */}
            <div>
                <input
                    type="text"
                    value={titulo}
                    onChange={handleTituloChange}
                    placeholder="Ingresa el título del producto"
                />
                <button onClick={buscarCategorias}>Buscar categorías</button>
            </div>

            {/* Step 2: Show posible categories */}
            {categorias.length > 0 && (
                <div>
                    <h2>Categorías sugeridas:</h2>
                    <ul>
                        {categorias.map((categoria) => (
                            <li key={categoria.id}>
                                <button onClick={() => handleCategoriaSeleccionada(categoria.id)}>
                                    {categoria.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Step 3: Dynamic form  */}
            {atributos.length > 0 && (
                <div>
                    <h2>Atributos para la categoría seleccionada</h2>
                    <form>
                        {atributos.map((atributo) => (
                            <div key={atributo.id}>
                                <label>{atributo.name}</label>
                                {atributo.values && atributo.values.length > 0 ? (
                                    <select
                                        onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {atributo.values.map((value: any) => (
                                            <option key={value.id} value={value.id}>
                                                {value.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </form>
                </div>
            )}

            {/* Show Product DEV ONLY */}
            {categoriaSeleccionada && (
                <div>
                    <h3>Producto generado:</h3>
                    <pre>{JSON.stringify(producto, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};



export default CrearProducto;
