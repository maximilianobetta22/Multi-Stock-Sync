import { useParams, Link } from 'react-router-dom';

const DevolucionesReembolsos = () => {
  const { client_id } = useParams<{ client_id: string }>();

  return (
    <div className="container mt-5">
      <h1>Devoluciones por Categoría</h1>
      <p>Client ID: {client_id}</p>
      <Link to={`/sync/reportes/devoluciones-reembolsos/${client_id}/12345`}>Ver Detalle de Reembolso</Link>
    </div>
  );
};

export default DevolucionesReembolsos;
