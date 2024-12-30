import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faFileInvoiceDollar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import { Link } from 'react-router-dom';

function Admin() {
  return (
    <>
      <Navbar />
      <div className="custom-background d-flex justify-content-center align-items-center">
        <div className="container text-center">
          <div className="row align-items-center">
            {/* Punto de Venta */}
            <div className="col-md-5">
              <Link to="/punto-venta">
                <FontAwesomeIcon icon={faDesktop} className="fa-4x text-primary" />
                <h3 className="mt-3">PUNTO DE VENTA</h3>
                <p className="mt-3 text-muted">Atiende al público</p>
              </Link>
            </div>

            {/* Arrow */}
            <div className="col-md-2 text-muted">
              <FontAwesomeIcon icon={faArrowRight} className="fa-2x" />
            </div>

            {/* Documentos */}
            <div className="col-md-5">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="fa-4x text-warning" />
              <h3 className="mt-3">DOCUMENTOS</h3>
              <p className="mt-3 text-muted">Genera facturas, notas de venta, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
