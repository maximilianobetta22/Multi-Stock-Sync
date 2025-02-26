import React, { useEffect, useState } from 'react';

const ResenaProducto: React.FC = () =>({ clientId, productId, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showResena, setShowResena] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const handleShowResena = (clientId, productId) => {
        setSelectedClientId(clientId);
        setSelectedProductId(productId);
        setShowResena(true);
    };

    const handleCloseResena = () => {
        setShowResena(false);
    };

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/reviews/${clientId}/${productId}`);
                const data = await response.json();

                if (data.status === "success") {
                    setReviews(data.data.reviews);
                } else {
                    setError("Error al obtener las reseñas.");
                }
            } catch (error) {
                setError("Error al conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [clientId, productId]);

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Reseñas del Producto</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {loading && <p className="text-center text-primary">Cargando reseñas...</p>}
                        {error && <p className="text-center text-danger">{error}</p>}
                        {reviews.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Título</th>
                                            <th>Contenido</th>
                                            <th>Calificación</th>
                                            <th>Fecha de Creación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map(review => (
                                            <tr key={review.id}>
                                                <td>{review.id}</td>
                                                <td>{review.title}</td>
                                                <td>{review.content}</td>
                                                <td>{review.rate}</td>
                                                <td>{new Date(review.date_created).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResenaProducto;
