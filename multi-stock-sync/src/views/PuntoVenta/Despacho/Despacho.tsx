import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import DespachoContent from './Content/DespachoContent';
import './Despacho.css';

const Despacho: React.FC = () => {
    return (
        <>
            <PuntoVentaNavbar />
            <div className="d-flex flex-grow-1 main-container">
                <div className="w-70 bg-light p-3 d-flex align-items-center justify-content-center">
                    <div>
                        <h1>Contenido Izquierdo</h1>
                        <p>Aquí va el contenido principal del lado izquierdo.</p>
                    </div>
                </div>
                <div className="w-30 custom-gray p-3 d-flex align-items-center justify-content-center">
                    <DespachoContent />
                </div>
            </div>
        </>
    );
};

export default Despacho;
