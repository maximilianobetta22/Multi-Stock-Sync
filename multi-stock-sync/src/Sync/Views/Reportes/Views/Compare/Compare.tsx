import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../axiosConfig';
import { generatePDF, exportToExcel, formatCurrency, months } from './utils/compareUtils';
import ComparisonForm from './components/ComparisonForm';
import ComparisonTable from './components/ComparisonTable';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { Modal } from 'react-bootstrap';
import styles from './Compare.module.css';

const Compare: React.FC = () => {
  const { mode, client_id } = useParams<{ mode?: string; client_id?: string }>();

  // Validación inicial de parámetros de la URL
  if (!mode || !client_id || (mode !== 'month' && mode !== 'year')) {
    return <div className="alert alert-danger">Parámetros inválidos en la URL.</div>;
  }

  const validMode = mode as 'month' | 'year';

  // Estados principales de control
  const [year1, setYear1] = useState('');
  const [month1, setMonth1] = useState('');
  const [year2, setYear2] = useState('');
  const [month2, setMonth2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  // Obtiene el nickname del usuario para mostrarlo en los reportes
  useEffect(() => {
    const fetchNickname = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
        );
        setNickname(response.data.data.nickname);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNickname();
  }, [client_id]);

  // Maneja el submit del formulario de comparación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = validMode === 'month' ? 'compare-sales-data' : 'compare-annual-sales-data';
    const params = validMode === 'month' ? { year1, month1, year2, month2 } : { year1, year2 };

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/${endpoint}/${client_id}`,
        { params }
      );
      setResult(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el reporte. Intenta más tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Genera el PDF de la comparación
  const handleGeneratePDF = () => {
    if (!result || !result.data) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay información para exportar al PDF.',
      });
      return;
    }

    const pdfUrl = generatePDF(validMode, nickname, result);
    setPdfDataUrl(pdfUrl);
    setShowModal(true);
  };

  // Exporta la comparación a un archivo Excel
  const handleExportExcel = () => {
    exportToExcel(validMode, result);
  };

  return (
    <>
      {/* Loading dinámico mientras se cargan datos */}
      {loading && <LoadingDinamico variant="container" />}

      <div className={styles.container} style={{ display: loading ? 'none' : 'block' }}>
        <h1>Comparar Ventas entre {validMode === 'month' ? 'Meses' : 'Años'}</h1>
        <p>USUARIO: {nickname}</p>

        {/* Formulario de comparación */}
        <ComparisonForm
          mode={validMode}
          year1={year1} setYear1={setYear1}
          month1={month1} setMonth1={setMonth1}
          year2={year2} setYear2={setYear2}
          month2={month2} setMonth2={setMonth2}
          onSubmit={handleSubmit}
        />

        {/* Resultados de la comparación */}
        {result && (
          <>
            <ComparisonTable
              mode={validMode}
              result={result}
              months={months}
              formatCurrency={formatCurrency}
            />

            {/* Resumen analítico de la comparación */}
            <div className={styles.summary}>
              <h4>Resumen de la Comparación</h4>
              {(() => {
                const modeIsYear = validMode === 'year';
                const data1 = modeIsYear ? result.data?.year1 : result.data?.month1;
                const data2 = modeIsYear ? result.data?.year2 : result.data?.month2;

                const year1Parsed = parseInt(data1?.year);
                const year2Parsed = parseInt(data2?.year);
                const total1 = data1?.total_sales || 0;
                const total2 = data2?.total_sales || 0;

                const recentIsYear2 = year2Parsed > year1Parsed;
                const recentLabel = modeIsYear
                  ? `${recentIsYear2 ? year2Parsed : year1Parsed}`
                  : `${recentIsYear2 ? months[data2?.month] : months[data1?.month]} ${recentIsYear2 ? data2?.year : data1?.year}`;

                const previousLabel = modeIsYear
                  ? `${recentIsYear2 ? year1Parsed : year2Parsed}`
                  : `${recentIsYear2 ? months[data1?.month] : months[data2?.month]} ${recentIsYear2 ? data1?.year : data2?.year}`;

                const recent = recentIsYear2 ? total2 : total1;
                const previous = recentIsYear2 ? total1 : total2;
                const difference = recent - previous;
                const percentage = previous === 0 ? 0 : ((difference / previous) * 100).toFixed(2);

                if (previous === 0) {
                  return (
                    <p>
                      En <strong>{recentLabel}</strong> se registraron ventas por <strong>{formatCurrency(recent)}</strong>, mientras que en <strong>{previousLabel}</strong> no hubo ventas registradas.
                      Esto indica el inicio de actividad comercial o una apertura significativa en el período actual.
                    </p>
                  );
                }

                if (difference === 0) {
                  return (
                    <p>
                      No hubo variación en las ventas entre <strong>{previousLabel}</strong> y <strong>{recentLabel}</strong>.
                    </p>
                  );
                }

                return (
                  <p>
                    Las ventas <strong>{difference > 0 ? 'aumentaron' : 'disminuyeron'}</strong> un{' '}
                    <strong>{Math.abs(Number(percentage))}%</strong> en <strong>{recentLabel}</strong> con respecto a{' '}
                    <strong>{previousLabel}</strong>, reflejando{' '}
                    {difference > 0 ? 'una mejora significativa' : 'una baja considerable'} en el rendimiento.
                  </p>
                );
              })()}
            </div>

            {/* Botones de acciones: PDF y Excel */}
            <div className={styles.actions}>
              <button onClick={handleGeneratePDF} className="btn btn-secondary me-2">
                Generar PDF
              </button>
              {validMode === 'year' && (
                <button onClick={handleExportExcel} className="btn btn-success">
                  Descargar Excel
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal para previsualizar el PDF */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reporte de Comparación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfDataUrl && <iframe src={pdfDataUrl} width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setShowModal(false)} className="btn btn-secondary">
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Compare;
// Este componente es una vista de comparación de ventas entre meses o años en una aplicación React.
// Permite al usuario seleccionar dos períodos y ver un resumen de las ventas, así como exportar los resultados a PDF o Excel. Utiliza axios para realizar peticiones a una API y Bootstrap para la interfaz de usuario.