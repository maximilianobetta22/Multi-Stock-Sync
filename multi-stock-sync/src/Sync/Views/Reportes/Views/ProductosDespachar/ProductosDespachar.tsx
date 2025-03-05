import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';

interface Producto {
    id: string;
    nombre: string;
    cantidad: number;
}

const ProductosDespachar: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [productosDespachar, setProductosDespachar] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${client_id}`
                );
                if (response.data.status === "success") {
                    setProductosDespachar(response.data.data);
                    console.log(response.data)
                } else {
                    setError("No se pudo obtener la lista de productos a despachar.");
                }
            } catch (err) {
                setError("Error al obtener los datos de la API.");
                console.error("Error en la solicitud:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [client_id]);

    if (loading) return <p>Cargando productos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>En proceso de creación</h2>
        </div>
    );
};

export default ProductosDespachar;
