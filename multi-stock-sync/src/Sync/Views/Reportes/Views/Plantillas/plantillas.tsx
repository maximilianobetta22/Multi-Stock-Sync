import React, { useState } from "react";
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
    { id: "MLC2498031396", producto: "Cuadro Mujer Lady Genny C-413", variante: "L", cantidad: 2, orden: "200010344476138", servicio: "240127", estado: "delivered" },
    { id: "MLC2498031396", producto: "Cuadro Mujer Lady Genny C-413", variante: "L", cantidad: 2, orden: "200010344476138", servicio: "240127", estado: "delivered" },
    { id: "MLC1526233719", producto: "Pack Alpargata Rojo", variante: "37", cantidad: 1, orden: "200010358398868", servicio: "240127", estado: "delivered" },
    { id: "MLC2401481162", producto: "Calza Mujer Lady Genny P-491", variante: "X/XL", cantidad: 1, orden: "200010368733202", servicio: "240127", estado: "delivered" },
    { id: "MLC1524934289", producto: "Cuadro Cotton Spandex", variante: "L", cantidad: 2, orden: "200010410670838", servicio: "240127", estado: "delivered" },
    { id: "MLC2498005332", producto: "Cuadro Mujer Jockey C-141", variante: "M", cantidad: 1, orden: "200010424078334", servicio: "354032", estado: "delivered" },
    { id: "MLC2498005332", producto: "Cuadro Mujer Jockey C-141", variante: "M", cantidad: 1, orden: "200010424078334", servicio: "354032", estado: "delivered" },
    { id: "MLC1481180253", producto: "Camiseta Mujer Lady Genny K-323", variante: "XL", cantidad: 1, orden: "200010642459696", servicio: "240127", estado: "delivered" },
    { id: "MLC1524843907", producto: "Calcetín Invisible Jockey", variante: "Único", cantidad: 1, orden: "200010707053838", servicio: "240127", estado: "delivered" },
    { id: "MLC1481182029", producto: "Colaless Mujer Lady Genny C-859", variante: "N/A", cantidad: 1, orden: "200010707053838", servicio: "240127", estado: "delivered" }
];

const ITEMS_PER_PAGE = 5;

// Colores para el gráfico
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6384"];

const Plantilla: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Contar cantidad de productos por variante para el gráfico
    const variantCounts = data.reduce((acc: { [key: string]: number }, item) => {
        acc[item.variante] = (acc[item.variante] || 0) + item.cantidad;
        return acc;
    }, {});

    const pieData = Object.keys(variantCounts).map((key, index) => ({
        name: key,
        value: variantCounts[key],
        color: COLORS[index % COLORS.length]
    }));

    return (
        <Container className="mt-4">
            <p>La idea de esta pagina es que tengan una referencia visual de como se tiene que ver algunos</p>
            <p> de los graficos,tablas y formato de los excel y pdf para que tenga referencia y codigo a mano</p>
            <h2>Reporte de Productos</h2>
            <Table striped bordered hover>
                <thead className="table-dark">
                    <tr>
                        <th>ID Producto</th>
                        <th>Producto</th>
                        <th>Variante</th>
                        <th>Cantidad</th>
                        <th>ID Orden</th>
                        <th>ID Orden Servicio</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.producto}</td>
                            <td>{item.variante}</td>
                            <td>{item.cantidad}</td>
                            <td>{item.orden}</td>
                            <td>{item.servicio}</td>
                            <td>{item.estado}</td>
                            <td>
                                <Button variant="primary">Ver Detalles</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Paginación */}
            <div className="d-flex justify-content-center align-items-center">
                <Button onClick={handlePrev} disabled={currentPage === 1} className="mx-2">
                    Anterior
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                    <Button key={i} onClick={() => setCurrentPage(i + 1)} variant={currentPage === i + 1 ? "dark" : "light"} className="mx-1">
                        {i + 1}
                    </Button>
                ))}
                <Button onClick={handleNext} disabled={currentPage === totalPages} className="mx-2">
                    Siguiente
                </Button>
            </div>

            {/* Gráfico de torta con texto al lado */}
            <Row className="mt-5">
                <Col md={6}>
                    <h4>Distribución de Productos por Variante</h4>
                    <ul>
                        {pieData.map((item, index) => (
                            <li key={index} style={{ color: item.color, fontWeight: "bold" }}>
                                {item.name}: {item.value}
                            </li>
                        ))}
                    </ul>
                </Col>
                <Col md={6}>
                    <PieChart width={400} height={400}>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </Col>
            </Row>
        </Container>
    );
};

export default Plantilla;
