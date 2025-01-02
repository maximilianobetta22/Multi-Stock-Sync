import Navbar from '../components/Navbar/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faFileInvoiceDollar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './InitialPage.css';
import { Link } from 'react-router-dom';

function InitialPage() {
  return (
    <>
      <Navbar />
      <div className="custom-background d-flex justify-content-center align-items-center">
        <div className="container text-center">
          <div className="row align-items-center">

            {/* Arrow */}
            <div className="col-md-2 text-muted">
              <FontAwesomeIcon icon={faArrowRight} className="fa-2x" />
              <p>Atiende al publico</p>
            </div>

            {/* Punto de Venta */}
            <div className="col-md-4">
              <Link to="/punto-venta">
                <FontAwesomeIcon icon={faDesktop} className="fa-4x text-primary" />
                <h3 className="mt-3 text-muted">PUNTO DE VENTA</h3>
              </Link>
            </div>

            {/* Documentos */}
            <div className="col-md-4">
              <Link to="/documentos">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="fa-4x text-warning" />
                <h3 className="mt-3 text-muted">DOCUMENTOS</h3>
              </Link>
            </div>

            {/* Arrow */}
            <div className="col-md-2 text-muted">
              <FontAwesomeIcon icon={faArrowRight} className="fa-2x rotate-180" />
              <p>Genera facturas, notas de venta, etc.</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default InitialPage;
