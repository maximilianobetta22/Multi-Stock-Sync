import { useState } from "react";
import { configuracionService } from "../Service/configuracionService";
import { ChangePasswordPayload } from "../Types/configuracionTypes";

export function useConfiguracionManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiarPassword = async (data: ChangePasswordPayload): Promise<boolean> => {
    console.log("🔧 Hook: Iniciando cambiarPassword con data:", data);
    
    try {
      console.log("⏳ Hook: Estableciendo loading=true");
      setLoading(true);
      setError(null);
      
      console.log("📡 Hook: Llamando a configuracionService.cambiarPassword");
      const result = await configuracionService.cambiarPassword(data);
      console.log("✅ Hook: Respuesta del servicio:", result);
      
      console.log("🎯 Hook: Retornando true");
      return true;
    } catch (error: any) {
      console.error("❌ Hook: Error capturado:", error);
      console.log("🔥 Hook: Estableciendo error:", error.message);
      setError(error.message || "Error al cambiar la contraseña");
      console.log("👎 Hook: Retornando false");
      return false;
    } finally {
      console.log("🏁 Hook: Estableciendo loading=false");
      setLoading(false);
    }
  };

  return { cambiarPassword, loading, error };
}