import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './OpinionesClients.module.css';

const OpinionesClientes = () => {
  const { productId } = useParams();
  const [rating, setRating] = useState(0);  // Estado para la calificación
  const [review, setReview] = useState('');  // Estado para el comentario
  const [submitted, setSubmitted] = useState(false);  // Para saber si el comentario fue enviado
  const [productDetails, setProductDetails] = useState(null);

  useEffect(() => {
    // Aquí podrás hacer la llamada para obtener el producto (si es necesario)
    // axios.get(`/api/product/${productId}`).then(response => setProductDetails(response.data));
  }, [productId]);

  // Función para manejar el cambio en la calificación
  const handleRating = (value: number) => {
    setRating(value);
  };

  // Función para manejar el envío del comentario
  const handleSubmit = () => {
    // Aquí deberías hacer la solicitud POST para guardar la calificación y comentario
    // axios.post('/api/reviews', { productId, rating, review }).then(() => setSubmitted(true));

    setSubmitted(true);  // Simulando que el comentario se envió
  };

  return (
    <div className={styles.container}>
      <h1>Califica el producto</h1>
      <div className={styles.productDetails}>
        {productDetails ? (
          <div>
            <h3>{productDetails.name}</h3>
            <img src={productDetails.imageUrl} alt={productDetails.name} />
          </div>
        ) : (
          <p>Cargando producto...</p>
        )}
      </div>

      <div className={styles.rating}>
        <p>Tu calificación:</p>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={star <= rating ? styles.filledStar : styles.emptyStar}
            onClick={() => handleRating(star)}
          />
        ))}
      </div>

      <div className={styles.reviewSection}>
        <textarea
          placeholder="Deja un comentario..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} className={styles.submitButton}>
        Enviar Comentario
      </button>

      {submitted && <p>¡Gracias por tu comentario!</p>}
    </div>
  );
};

export default OpinionesClientes;
