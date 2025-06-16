import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig"; // Ajusta el path si es necesario
import axios from "axios";

interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  role_id: number | null;
  rol?: Rol;
}

interface UseGestionUsuariosResult {
  usuarios: Usuario[];
  roles: Rol[];
  loading: boolean;
  error: string | null;
}

const useGestionUsuarios = (): UseGestionUsuariosResult => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No se encontró el token de autenticación.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [usuariosRes, rolesRes] = await Promise.all([
          axiosInstance.get(`${import.meta.env.VITE_API_URL}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          axiosInstance.get(`${import.meta.env.VITE_API_URL}/roles`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        setUsuarios(usuariosRes.data || []);
        setRoles(rolesRes.data || []);
      } catch (err: any) {
        console.error("Error en la carga de usuarios o roles:", err);

        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(err.response.data?.message || "Error en la API");
          } else {
            setError("Error de red al intentar conectar con el servidor.");
          }
        } else {
          setError("Error inesperado al obtener datos.");
        }

        setUsuarios([]);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { usuarios, roles, loading, error };
};

export default useGestionUsuarios;
