import React, { useState } from "react";
import PuntoVentaNavbar from "../../../components/PuntoVentaNavbar/PuntoVentaNavbar";
import DespachoContent from "./Content/DespachoContent";
import styles from "./Despacho.module.css";

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

  const handleAddDocumento = (documento: Documento) => {
    setDocumentoSeleccionado(documento);
  };

  return (
    <>
      <PuntoVentaNavbar />
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-70 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            <h2>Documentos Seleccionados</h2>
            <table className={styles.documentTableContainer}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Autor</th>
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
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5}>No se ha seleccionado ningún documento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-30 custom-gray p-3 d-flex align-items-center justify-content-center">
          <DespachoContent onAddDocumento={handleAddDocumento} />
        </div>
      </div>
    </>
  );
};

export default Despacho;
