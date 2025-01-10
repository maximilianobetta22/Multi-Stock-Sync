import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PuntoVentaNavbar from '../../../components/PuntoVentaNavbar/PuntoVentaNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import './Reimprimir.css';

const Reimprimir: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchText, setSearchText] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [copies, setCopies] = useState(1);
  const documentos = [
    { id: 1, titulo: 'BOLETA MANUAL Nº 5', monto: '$2.120', fecha: '31/12/2024', usuario: 'Marcos Reyes' },
    { id: 2, titulo: 'FACTURA ELECTRÓNICA Nº 10', monto: '$5.400', fecha: '30/12/2024', usuario: 'Marcos Reyes' },
    { id: 3, titulo: 'GUIA DE DESPACHO MANUAL Nº 3', monto: '$890', fecha: '31/12/2024', usuario: 'Marcos Reyes' },
    { id: 4, titulo: 'GUIA DE DESPACHO MANUAL Nº 4', monto: '$9000', fecha: '09/01/2025', usuario: 'Marcos Reyes' },
    { id: 5, titulo: 'GUIA DE DESPACHO MANUAL Nº 8', monto: '$8000', fecha: '09/01/2025', usuario: 'Marcos Reyes' }
  ];

  const filteredDocuments = documentos.filter((doc) => {
    const isMatchingDate = selectedDate ? doc.fecha === selectedDate.toLocaleDateString('en-GB') : true;
    const isMatchingSearch =
      doc.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.monto.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.fecha.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.usuario.toLowerCase().includes(searchText.toLowerCase());
    return isMatchingDate && isMatchingSearch;
  });

  const clearFilters = () => {
    setSelectedDate(new Date());
    setSearchText('');
  };

  const incrementCopies = () => setCopies(copies + 1);
  const decrementCopies = () => setCopies(copies > 1 ? copies - 1 : 1);

  return (
    <>
      <PuntoVentaNavbar />
      <div className="d-flex flex-grow-1">

        <div className="w-70 bg-light p-3 d-flex align-items-center justify-content-center">
          <div>
            {selectedDocument ? (
              <div className="document-details">
                <h2>{selectedDocument.titulo}</h2>
                <div className="document-actions">
                  <div className="copies-section">
                    <div className="copies-container">
                      <p>Copias</p>
                      <div className="copies-controls">
                        <button onClick={decrementCopies} className="control-btn">-</button>
                        <input value={copies} className="copies-input" />
                        <button onClick={incrementCopies} className="control-btn">+</button>
                      </div>
                    </div>
                    <button className="btn-multistock">REIMPRIMIR</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1>Contenido Izquierdo</h1>
                <p>Seleccione un documento para ver los detalles aquí.</p>
              </div>
            )}
          </div>
        </div>


        <div className="w-30 custom-gray p-3 d-flex align-items-center justify-content-center">
          <div>
            <h2>
              <FontAwesomeIcon icon={faFileAlt} className="icon" /> Documentos Disponibles
            </h2>
            <div>
              <div className="date-picker-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="date-picker-input"
                />
              </div>
              <input
                type="text"
                placeholder="Buscar"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <button onClick={clearFilters} className="clear-btn btn btn-primary">
                Limpiar
              </button>
            </div>
            <div className="documentos-resultados">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="documento-item">
                    <div className="documento-info">
                      <h4>{doc.titulo}</h4>
                      <p>
                        {doc.monto} / {doc.fecha} / {doc.usuario}
                      </p>
                    </div>
                    <button
                      className="reimprimir-btn "
                      style={{ marginLeft: '20px' }}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-records">Sin Registros</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reimprimir;
