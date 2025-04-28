import React from "react";
import styles from "../Compare.module.css";

interface Props {
  mode: "month" | "year";
  year1: string;
  setYear1: (val: string) => void;
  month1: string;
  setMonth1: (val: string) => void;
  year2: string;
  setYear2: (val: string) => void;
  month2: string;
  setMonth2: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// Meses del año ordenados
const orderedMonths = [
  ["01", "Enero"],
  ["02", "Febrero"],
  ["03", "Marzo"],
  ["04", "Abril"],
  ["05", "Mayo"],
  ["06", "Junio"],
  ["07", "Julio"],
  ["08", "Agosto"],
  ["09", "Septiembre"],
  ["10", "Octubre"],
  ["11", "Noviembre"],
  ["12", "Diciembre"]
];

// Últimos 10 años para selección en formulario
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

const ComparisonForm: React.FC<Props> = ({
  mode,
  year1,
  setYear1,
  month1,
  setMonth1,
  year2,
  setYear2,
  month2,
  setMonth2,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className={styles.formSection}>
        {/* Año 1 */}
        <div>
          <label>Año 1</label>
          <select className="form-control" value={year1} onChange={(e) => setYear1(e.target.value)} required>
            <option value="">Seleccione un año</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Mes 1 (solo si se compara por mes) */}
        {mode === "month" && (
          <div>
            <label>Mes 1</label>
            <select className="form-control" value={month1} onChange={(e) => setMonth1(e.target.value)} required>
              <option value="">Seleccione un mes</option>
              {orderedMonths.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Año 2 */}
        <div>
          <label>Año 2</label>
          <select className="form-control" value={year2} onChange={(e) => setYear2(e.target.value)} required>
            <option value="">Seleccione un año</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Mes 2 (solo si se compara por mes) */}
        {mode === "month" && (
          <div>
            <label>Mes 2</label>
            <select className="form-control" value={month2} onChange={(e) => setMonth2(e.target.value)} required>
              <option value="">Seleccione un mes</option>
              {orderedMonths.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className={styles.buttonContainer}>
        <button type="submit" className="btn btn-primary">Comparar</button>
        <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
          Volver
        </button>
      </div>
    </form>
  );
};

export default ComparisonForm;
// Este componente es un formulario para comparar ventas entre dos años o meses. Permite seleccionar los años y meses a comparar y envía la información al evento onSubmit.
// Se utiliza en la vista de comparación de ventas entre meses o años. El formulario incluye validaciones para asegurar que se seleccionen los valores requeridos antes de enviar el formulario.