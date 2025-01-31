import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './OpinionesClients.module.css';

interface Review {
  id: number;
  product_id: string;
  comment: string;
  rating: number;
}

const OpinionesClientes: React.FC = () => {
  const { client_id, product_id } = useParams<{ client_id: string; product_id: string }>();
  const [opiniones, setOpiniones] = useState<Review[]>([]);
  const [ratingAverage, setRatingAverage] = useState<number>(0);

  useEffect(() => {
    if (!client_id || !product_id) {
      console.error('client_id o product_id no están disponibles');
      return;
    }

    const fetchOpiniones = async () => {
      try {
        const response = await axios.get(
          `/mercadolibre/products/reviews/${product_id}?client_id=${client_id}`
        );

        const data = response.data?.data;
        if (data && Array.isArray(data.reviews)) {
          const formattedOpinions = data.reviews.map((review: any, index: number) => ({
            id: index + 1, 
            product_id: product_id,
            comment: review.comment || 'Sin comentario',
            rating: review.rating || 0,
          }));

          setOpiniones(formattedOpinions);
          setRatingAverage(data.rating_average);
        } else {
          console.error('La respuesta de la API no contiene opiniones válidas');
        }
      } catch (error) {
        console.error('Error al obtener opiniones:', error);
      }
    };

    fetchOpiniones();
  }, [client_id, product_id]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Opiniones de Clientes</h1>

      <div className="mb-12 space-y-8">
        <h2 className={styles.sectionTitle}>Calificación promedio: {ratingAverage.toFixed(1)} ⭐</h2>
        
        {opiniones.length > 0 ? (
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Comentario</th>
                <th className="px-4 py-2">Estrellas</th>
              </tr>
            </thead>
            <tbody>
              {opiniones.map((opinion) => (
                <tr key={opinion.id}>
                  <td className="border px-4 py-2">{opinion.comment}</td>
                  <td className="border px-4 py-2">
                    {[...Array(5)].map((_, index) => (
                      <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        color={index < opinion.rating ? 'gold' : 'gray'}
                        className="text-xl"
                      />
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay opiniones disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default OpinionesClientes;
