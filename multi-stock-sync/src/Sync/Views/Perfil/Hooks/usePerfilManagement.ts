import { useState, useEffect } from 'react';
import { usuarioService } from '../Service/usuarioService';

import { User } from '../Types/usuarioTypes';


export function usePerfilManagement(userId: number) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usuarioService.obtenerUsuarioPorId(userId)
      .then(data => setUsuario(data))
      .catch(() => setError("Error al cargar el perfil"))
      .finally(() => setLoading(false));
  }, [userId]);

  return { usuario, loading, error };
}
