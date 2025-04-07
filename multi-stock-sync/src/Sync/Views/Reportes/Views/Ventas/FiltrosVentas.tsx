import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface Props {
  filtroActivo: "mes" | "año" | null;
  setFiltroActivo: (valor: "mes" | "año" | null) => void;
  yearSeleccionado: number;
  setYearSeleccionado: (valor: number) => void;
  monthSeleccionado: number;
  setMonthSeleccionado: (valor: number) => void;
  years: string[];
}

const FiltrosVentas: React.FC<Props> = ({
  filtroActivo,
  setFiltroActivo,
  yearSeleccionado,
  setYearSeleccionado,
  monthSeleccionado,
  setMonthSeleccionado,
  years,
}) => {
  return (
    <Form className="mb-4">
      <Row className="d-flex justify-content-center">
        {/* Filtro por mes */}
        <Col xs="auto" className="mb-3">
          <Button
            variant={filtroActivo === "mes" ? "primary" : "outline-primary"}
            onClick={() => setFiltroActivo(filtroActivo === "mes" ? null : "mes")}
            disabled={filtroActivo === "año"}
            className="w-100 d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faFilter} className="me-2" /> Filtrar por Mes
          </Button>
          {filtroActivo === "mes" && (
            <div className="mt-2">
              <Row className="d-flex justify-content-center">
                <Col xs="auto">
                  <Form.Group controlId="formYear">
                    <Form.Label>Año</Form.Label>
                    <Form.Control
                      as="select"
                      value={yearSeleccionado}
                      onChange={(e) => setYearSeleccionado(Number(e.target.value))}
                      className="w-auto"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  <Form.Group controlId="formMonth">
                    <Form.Label>Mes</Form.Label>
                    <Form.Control
                      as="select"
                      value={monthSeleccionado}
                      onChange={(e) => setMonthSeleccionado(Number(e.target.value))}
                      className="w-auto"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Col>

        {/* Filtro por año */}
        <Col xs="auto" className="mb-3">
          <Button
            variant={filtroActivo === "año" ? "primary" : "outline-primary"}
            onClick={() => setFiltroActivo(filtroActivo === "año" ? null : "año")}
            disabled={filtroActivo === "mes"}
            className="w-100 d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faFilter} className="me-2" /> Filtrar por Año
          </Button>
          {filtroActivo === "año" && (
            <div className="mt-2">
              <Form.Group className="d-flex flex-column align-items-center">
                <Form.Label>Año</Form.Label>
                <Form.Control
                  as="select"
                  value={yearSeleccionado}
                  onChange={(e) => setYearSeleccionado(Number(e.target.value))}
                  className="w-auto"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default FiltrosVentas;
