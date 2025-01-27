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

    // API
    const fetchOpiniones = async () => {
      try {
        const response = await axios.get(`${client_id}`);
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
  //???
  const handleEliminarOpinion = async (id: number) => {
    try {
      await axios.delete(`${id}`);
      setOpiniones((prevOpiniones) =>
        prevOpiniones.filter((opinion) => opinion.id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar opinión:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Opiniones de Clientes</h1>

      
      <div className="mb-12 space-y-8">
        <h2 className={styles.sectionTitle}>Lista de Opiniones</h2>
        {opiniones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opiniones.map((opinion) => (
              <div key={opinion.id} className={styles.opinionCard}>
                <h3 className={styles.productName}>{opinion.producto}</h3>
                <p className={styles.comment}>{opinion.comentario}</p>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={faStar}
                      color={index < opinion.estrellas ? 'gold' : 'gray'}
                      className="text-xl"
                    />
                  ))}
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleEliminarOpinion(opinion.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
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
