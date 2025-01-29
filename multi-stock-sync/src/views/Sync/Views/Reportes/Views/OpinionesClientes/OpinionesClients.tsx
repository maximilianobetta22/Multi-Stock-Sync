import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './OpinionesClients.module.css';

interface Opinion {
  id: number;
  producto: string;
  comentario: string;
  estrellas: number;
}

interface NuevaOpinion {
  producto: string;
  comentario: string;
  estrellas: number;
}

const OpinionesClientes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [opiniones, setOpiniones] = useState<Opinion[]>([]);
  const [nuevaOpinion, setNuevaOpinion] = useState<NuevaOpinion>({
    producto: '',
    comentario: '',
    estrellas: 0,
  });

  useEffect(() => {
    if (!client_id) {
      console.error('client_id no está disponible');
      return;
    }

    // API para obtener las opiniones
    const fetchOpiniones = async () => {
      try {
        const response = await axios.get(`/api/opiniones/${client_id}`);
        if (Array.isArray(response.data)) {
          setOpiniones(response.data);
        } else {
          console.error('Los datos no son un array válido');
        }
      } catch (error) {
        console.error('Error al obtener opiniones:', error);
      }
    };
    fetchOpiniones();
  }, [client_id]);

  const handleCalificar = (index: number) => {
    setNuevaOpinion({ ...nuevaOpinion, estrellas: index + 1 });
  };

  const handleAgregarOpinion = async () => {
    if (!nuevaOpinion.producto || !nuevaOpinion.comentario) {
      console.error('Producto y comentario son obligatorios');
      return;
    }
    try {
      const response = await axios.post('/api/opiniones', {
        ...nuevaOpinion,
        client_id,
      });
      setOpiniones((prevOpiniones) => [...prevOpiniones, response.data]);
      setNuevaOpinion({ producto: '', comentario: '', estrellas: 0 });
    } catch (error) {
      console.error('Error al agregar opinión:', error);
    }
  };

  const handleEliminarOpinion = async (id: number) => {
    try {
      await axios.delete(`/api/opiniones/${id}`);
      setOpiniones((prevOpiniones) =>
        prevOpiniones.filter((opinion) => opinion.id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar opinión:', error);
    }
  };

  // Función para agrupar las opiniones por producto
  const agruparPorProducto = (opiniones: Opinion[]) => {
    return opiniones.reduce((secciones, opinion) => {
      const { producto } = opinion;
      if (!secciones[producto]) {
        secciones[producto] = [];
      }
      secciones[producto].push(opinion);
      return secciones;
    }, {} as Record<string, Opinion[]>);
  };

  const opinionesAgrupadas = agruparPorProducto(opiniones);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Opiniones de Clientes</h1>

      <div className="mb-12 space-y-8">
        <h2 className={styles.sectionTitle}>Lista de Opiniones</h2>
        {Object.keys(opinionesAgrupadas).length > 0 ? (
          Object.entries(opinionesAgrupadas).map(([producto, opinionesProducto]) => (
            <div key={producto}>
              <h3 className={styles.sectionTitle}>{producto}</h3>
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Comentario</th>
                    <th className="px-4 py-2">Estrellas</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {opinionesProducto.map((opinion) => (
                    <tr key={opinion.id}>
                      <td className="border px-4 py-2">{opinion.comentario}</td>
                      <td className="border px-4 py-2">
                        {[...Array(5)].map((_, index) => (
                          <FontAwesomeIcon
                            key={index}
                            icon={faStar}
                            color={index < opinion.estrellas ? 'gold' : 'gray'}
                            className="text-xl"
                          />
                        ))}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded"
                          onClick={() => handleEliminarOpinion(opinion.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No hay opiniones disponibles.</p>
        )}
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.sectionTitle}>Agregar Nueva Opinión</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Producto"
            value={nuevaOpinion.producto}
            onChange={(e) =>
              setNuevaOpinion({ ...nuevaOpinion, producto: e.target.value })
            }
            className={styles.inputField}
          />
          <textarea
            placeholder="Comentario"
            value={nuevaOpinion.comentario}
            onChange={(e) =>
              setNuevaOpinion({ ...nuevaOpinion, comentario: e.target.value })
            }
            className={styles.textArea}
          />
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                color={index < nuevaOpinion.estrellas ? 'gold' : 'gray'}
                onClick={() => handleCalificar(index)}
                className="cursor-pointer text-2xl"
              />
            ))}
          </div>
          <button
            className={styles.addButton}
            onClick={handleAgregarOpinion}
          >
            Agregar Opinión
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpinionesClientes;
