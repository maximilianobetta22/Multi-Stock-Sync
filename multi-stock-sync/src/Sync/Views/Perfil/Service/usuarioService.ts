import axiosInstance from "../../../../axiosConfig"

export const usuarioService = {
  async obtenerUsuarioPorId(id: number) {
    try {
      const url = `${import.meta.env.VITE_API_URL}/users/${id}`
      const response = await axiosInstance.get(url)
      return response.data.user
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      throw error
    }
  },

async actualizarUsuario(id: number, datosActualizados: object) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/users/${id}`;

    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;
    await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${clientId}`)
    

    const response = await axiosInstance.patch(url, datosActualizados, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

}
