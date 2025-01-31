import { useParams } from 'react-router-dom';

const DevolucionesReembolsos = () => {
  const { client_id } = useParams<{ client_id: string }>();


  return (
    <div className="container mt-5">
      <h1>Devoluciones por Categoría</h1>
      <p>Client ID: {client_id}</p>
    </div>
  );
};

export default DevolucionesReembolsos;
