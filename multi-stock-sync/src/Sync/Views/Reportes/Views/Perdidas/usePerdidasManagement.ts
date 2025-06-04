import React from "react";
import axiosInstance from "../../../../../axiosConfig";
import axios from "axios";

export interface CancelledProductItem {
    id: number;
    created_date: string;
    total_amount: number;
    status: string;
    product: {
        title: string;
        quantity: number;
        price: number;
    };
}

export interface CancelledProductsResponse {
    orders: CancelledProductItem[];
    total_cancelled: number;
}

export const usePerdidasManagement = () => {
    const [productosPerdidos, setProductosPerdidos] = React.useState<CancelledProductItem[]>([]);
    const [totalMontoGlobalPerdido, setTotalMontoGlobalPerdido] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchPerdidasEmpresa = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get<CancelledProductsResponse>(
                `${import.meta.env.VITE_API_URL}/mercadolibre/cancelled-products`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                    },
                }
            );
            console.log("PerdidasEmpresa API response:", JSON.stringify(response.data, null, 2));

            if (!Array.isArray(response.data)) {
                throw new Error("Estructura de respuesta de API inválida");
            }

        } catch (err) {
            console.error("Error en usePerdidasManagement.fetchPerdidasEmpresa:", err);
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 403 || err.response.status === 401) {
                    setError("Acceso denegado. Por favor, verifica tus permisos.");
                } else {
                    setError(err.response.data.message || "Error obteniendo los datos de pérdidas.");
                }
            } else {
                setError("Ocurrió un error inesperado al obtener los datos de pérdidas.");
            }
            setProductosPerdidos([]);
            setTotalMontoGlobalPerdido(0);
        } finally {
            setLoading(false);
        }
    };

    return {
        productosPerdidos,
        totalMontoGlobalPerdido,
        loading,
        error,
        fetchPerdidasEmpresa,
    };
};