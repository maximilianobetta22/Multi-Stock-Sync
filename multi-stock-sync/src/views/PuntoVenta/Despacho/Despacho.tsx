import React, { useState } from "react";
import PuntoVentaNavbar from "../../../components/PuntoVentaNavbar/PuntoVentaNavbar";
import { faXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import DespachoContent from "./Content/DespachoContent";
import DespachoPdf from "./DespachoPdf/DespachoPdf";
import styles from "./Despacho.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Documento {
  id: number;
  tipo: string;
  numero: string;
  total: string;
  fecha: string;
  autor: string;
}

const Despacho: React.FC = () => {
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<Documento | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  const handleAddDocumento = (documento: Documento) => {
    setDocumentoSeleccionado(documento);
  };
  const handleRemoveDocumento = () => {
    setDocumentoSeleccionado(null);
    setShowPdf(false);
  };

  const handleDespachar = () => {
    setShowPdf(true); // Cambia a la vista PDF
  };

  /**Tabla Documentos */
  const renderTable = () => {
    return (
      <div className={styles.documentTableContainer}>
        <h2>Documentos Seleccionados</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Número</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Autor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documentoSeleccionado ? (
              <tr key={documentoSeleccionado.id}>
                <td>{documentoSeleccionado.tipo}</td>
                <td>{documentoSeleccionado.numero}</td>
                <td>{documentoSeleccionado.total}</td>
                <td>{documentoSeleccionado.fecha}</td>
                <td>{documentoSeleccionado.autor}</td>
                <td>
                  <button
                    className={styles.xMarkButton}
                    onClick={handleRemoveDocumento}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={6}>No se ha seleccionado ningún documento.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className={styles.detalleFooter}>
          <div className={styles.footerLeft}>{searchBar()}</div>
          <div className={styles.footerRight}>{despacho()}</div>
        </div>
      </div>
    );
  };

  /**Barra buscadora de clientes */
  const searchBar = () => {
    return (
      <div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Clientes"
        />
        <button className={styles.searchButton}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    );
  };

  const despacho = () => {
    return (
      <div className={styles.despachoContainer}>
        <div className={styles.totalContainer}>
          <h6>Total:</h6>
          {documentoSeleccionado ? (
            <p key={documentoSeleccionado.id}>{documentoSeleccionado.total}</p>
          ) : (
            <p>0.00</p>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleDespachar}>Despachar</button>
          <span onClick={handleRemoveDocumento}>cancelar</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <PuntoVentaNavbar />
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-70 bg-light p-3 d-flex align-items-center justify-content-center">
          {renderTable()}
        </div>
        <div className="w-30 custom-gray p-3 d-flex align-items-center justify-content-center">
          {showPdf ? (
            <DespachoPdf />
          ) : (
            <DespachoContent onAddDocumento={handleAddDocumento} />
          )}
        </div>
      </div>
    </>
  );
};

export default Despacho;
