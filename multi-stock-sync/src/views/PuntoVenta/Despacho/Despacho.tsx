import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import DespachoContent from './Content/DespachoContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './Despacho.css';

const Despacho = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="despacho-container">
                <div className="main-section">
                    
                </div>
                <div className="sidebar">
                    <DespachoContent />
                </div>
            </div>
            <FooterActionsDespacho/>
        </>
    );
};

const FooterActionsDespacho = () => (
    <div className="footer-actions-despacho">
        <div className="footer-left-despacho">
            <div className="footer-bottom">
                <button className="footer-gray-button">
                Cancelar <FontAwesomeIcon icon={faXmark} />
                </button>
                <button className="despachar-button">
                    Despachar <FontAwesomeIcon icon={faCheck} />
                </button>
            </div>
            <div className="totales">
                <div className="totales-item">
                    <span>Neto:</span>
                    <span>$0</span>
                </div>
                <div className="totales-item">
                    <span>Impuesto:</span>
                    <span>$0</span>
                </div>
                <div className="totales-item total-grande">
                    <span>Total:</span>
                    <span>$0</span>
                </div>
            </div>
        </div>
        <div className="footer-right-despacho">

        </div>
    </div>
);

export default Despacho;