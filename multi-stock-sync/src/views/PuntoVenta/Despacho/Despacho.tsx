import PuntoVentaNavbar from "../../../components/PuntoVentaNavbar/PuntoVentaNavbar";
import DespachoContent from "./Content/DespachoContent";
import DespachoList from "./ContentList/DespachoList";

const Despacho: React.FC = () => {
  return (
    <>
      <PuntoVentaNavbar />
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-70 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <DespachoList />
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
