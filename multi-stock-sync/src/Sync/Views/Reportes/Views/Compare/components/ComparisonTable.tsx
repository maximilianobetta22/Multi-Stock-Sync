import React, { useState } from 'react';
import styles from '../Compare.module.css';

interface Props {
  mode: 'month' | 'year';
  result: any;
  months: { [key: string]: string };
  formatCurrency: (val: number) => string;
}

const ComparisonTable: React.FC<Props> = ({ mode, result, months, formatCurrency }) => {
  const data1 = mode === 'month' ? result.data?.month1 : result.data?.year1;
  const data2 = mode === 'month' ? result.data?.month2 : result.data?.year2;

  const label1 = mode === 'month'
    ? `${months[data1?.month] || '-'} ${data1?.year || ''}`
    : data1?.year || '-';

  const label2 = mode === 'month'
    ? `${months[data2?.month] || '-'} ${data2?.year || ''}`
    : data2?.year || '-';

  const total1 = data1?.total_sales || 0;
  const total2 = data2?.total_sales || 0;

  // Detectar cuál año es más reciente
  const isYearMode = mode === 'year';
  const year1Num = parseInt(data1?.year);
  const year2Num = parseInt(data2?.year);
  const isYear2MoreRecent = isYearMode && year2Num > year1Num;

  // Elegir orden de comparación para análisis
  const recentSales = isYear2MoreRecent ? total2 : total1;
  const previousSales = isYear2MoreRecent ? total1 : total2;
  const difference = recentSales - previousSales;

  const percentageChange = previousSales === 0
    ? 0
    : ((difference / previousSales) * 100).toFixed(2);

 

  const [verDetalle, setVerDetalle] = useState(false);

  return (
    <div className={styles.cardResumen}>
      <h2 className={styles.titulo}>Resumen de la Comparación</h2>
      <div className={styles.resumenGrid}>
        <div>
          <p><strong>{label1}</strong></p>
          <p>Total ventas: {formatCurrency(total1)}</p>
        </div>
        <div>
          <p><strong>{label2}</strong></p>
          <p>Total ventas: {formatCurrency(total2)}</p>
        </div>
        <div>
          <p><strong>Diferencia:</strong></p>
          <p style={{ color: difference >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(difference)}</p>
        </div>
        <div>
          <p><strong>Cambio porcentual:</strong></p>
          <p style={{ color: difference >= 0 ? '#28a745' : '#dc3545' }}>{percentageChange}%</p>
        </div>
      </div>

      <button className="btn btn-dark mt-4" onClick={() => setVerDetalle(!verDetalle)}>
        {verDetalle ? 'Ocultar Detalle de Productos' : 'Ver Detalle de Productos'}
      </button>

      {verDetalle && (
        <div className={styles.detalleSeccion}>
          {[{ data: data1, label: label1 }, { data: data2, label: label2 }].map(({ data, label }, idx) => (
            <div key={idx} className={styles.detalleTabla}>
              <h5>{label}</h5>
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.sold_products?.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>{p.title}</td>
                      <td>{p.quantity}</td>
                      <td>{formatCurrency(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
