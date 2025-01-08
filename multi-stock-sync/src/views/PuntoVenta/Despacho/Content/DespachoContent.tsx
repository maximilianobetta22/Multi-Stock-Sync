import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import content from "./DespachoContent.module.css";

interface Documento {
  id: number;
  tipo: string;
  numero: string;
  total: string;
  fecha: string;
  autor: string;
}

interface Props {
  onAddDocumento: (documento: Documento) => void;
}

const DespachoContent: React.FC<Props> = ({ onAddDocumento }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const documentos = [
    {
      id: 1,
      tipo: "BOLETA MANUAL (no válido al SII)",
      numero: "Nº 5",
      total: "$ 2.120",
      fecha: "30/12/2024",
      autor: "Marcos Reyes",
    },
    {
      id: 2,
      tipo: "FACTURA ELECTRÓNICA",
      numero: "Nº 10",
      total: "$ 5.400",
      fecha: "28/12/2024",
      autor: "Marcos Reyes",
    },
  ];

  const filteredDocumentos = documentos.filter((doc) =>
    `${doc.tipo} ${doc.numero}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={content.despachoContent}>
      <div className={content.headerSection}>
        <h2 className={content.despachoHeader}>
          <FontAwesomeIcon icon={faSearch} className={content.headerIcon} />{" "}
          Documentos Disponibles
        </h2>
        <div
          className={content.searchBarDespacho}
          style={{ marginLeft: "20px" }}
        >
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={content.searchInputDespacho}
          />
          <button className={content.searchButtonDespacho}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      <ul className={content.documentoList}>
        {filteredDocumentos.length > 0 ? (
          filteredDocumentos.map((doc) => (
            <li key={doc.id} className="documento-item">
              <div>
                <span className={content.documentoTipo}>{doc.tipo}</span>{" "}
                <span className={content.documentoNumero}>{doc.numero}</span>
                <p className={content.documentoDetalles}>
                  {doc.total} / {doc.fecha} / {doc.autor}
                </p>
              </div>
              <button
                className={content.documentoCheck}
                onClick={() => onAddDocumento(doc)}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
            </li>
          ))
        ) : (
          <p className="no-documento">Documento no encontrado</p>
        )}
      </ul>
    </div>
  );
};

export default DespachoContent;
