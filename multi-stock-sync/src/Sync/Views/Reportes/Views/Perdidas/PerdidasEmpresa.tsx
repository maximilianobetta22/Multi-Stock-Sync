import React, { useEffect, useState } from "react";
import {
    message,
    Card,
    Typography,
    Space,
    Empty,
    Button as AntButton,
    Dropdown as AntDropdown,
    Menu as AntMenu,
    Row,
    Statistic,
    Col,
    Divider,
} from "antd";
import type { ChartOptions } from 'chart.js';
import {
    FilePdfOutlined,
    FileExcelOutlined,
    DownOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title as ChartTitle } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { usePerdidasManagement, CancelledProductItem } from "./usePerdidasManagement";
import styles from "./PerdidasEmpresa.module.css";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle, ChartDataLabels);
const { Title, Text } = Typography;

interface FormattedProductLoss {
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalAmountLost: number;
    cancellationDate: Date;
    status: string;
    id: number;
}

const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: { boxWidth: 15, padding: 20, font: { size: 12 } }
        },
        title: { display: false },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.parsed;
                    const total = (context.dataset.data as number[]).reduce((acc, val) => acc + val, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    if (datasetLabel.includes('Monto')) {
                        return `${context.label}: ${new Intl.NumberFormat("es-CL",
                            { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value)} (${percentage}%)`;
                    }
                    return `${context.label}: ${value} uds. (${percentage}%)`;
                }
            }
        },
        datalabels: {
            formatter: (value, context) => {
                const total = (context.chart.data.datasets[0].data as number[]).reduce((acc, val) => acc + val, 0);
                const percentage = total > 0 ? (value / total) * 100 : 0;
                if (percentage < 3) return '';
                return percentage.toFixed(0) + '%';
            },
            color: '#fff',
            font: { weight: 'bold', size: 14 },
        }
    },
};

export default function PerdidasEmpresa() {
    const {
        productosPerdidos,
        totalMontoGlobalPerdido,
        loading,
        error,
        fetchPerdidasEmpresa,
    } = usePerdidasManagement();
    const [messageApi, contextHolder] = message.useMessage();

    const [maxChartItems, setMaxChartItems] = useState(5);
    const [sortChartBy, setSortChartBy] = useState<'quantity' | 'amount'>('amount');
    
    useEffect(() => {
        fetchPerdidasEmpresa();
    }, []);

    useEffect(() => {
        if (error) messageApi.error(error);
    }, [error, messageApi]);

    const formattedData: FormattedProductLoss[] = React.useMemo(() => {
        return productosPerdidos.map((item: CancelledProductItem) => ({
            productTitle: item.product?.title || "N/A",
            quantity: item.product?.quantity || 0,
            unitPrice: item.product?.price || 0,
            totalAmountLost: (item.product?.quantity || 0) * (item.product?.price || 0),
            cancellationDate: new Date(item.created_date),
            status: item.status,
            id: item.id,
        }));
    }, [productosPerdidos]);

// Calcular total
const totalUnidadesCanceladas = formattedData.reduce((sum, item) => sum+
item.quantity, 0);

const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
});

// Exportar a Excel
const exportToExcel = () => {
    const worksheetData = formattedData.map(item => ({
        "ID Orden": item.id,
        "Producto": item.productTitle,
        "Cantidad Cancelada": item.quantity,
        "Precio Unitario (CLP)": item.unitPrice,
        "Monto Perdido (CLP)": item.totalAmountLost,
        "Fecha Cancelación": item.cancellationDate.toLocaleDateString("es-ES"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PerdidasPorCancelacion");
    XLSX.writeFile(workbook, `Reporte_Detallado_Perdidas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    messageApi.success("Reporte detallado exportado a Excel.");
};

// Exportar a pdf
const generatePDF = () => {
    const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Reporte de Pérdidas por Cancelación", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);
    doc.text(`Monto Total Perdido (Global): ${currencyFormatter.format(totalMontoGlobalPerdido)}`, 14, 36);

    autoTable(doc, {
            startY: 45,
            head: [["Producto", "Cantidad", "Precio Unit.", "Monto Perdido", "Fecha"]],
            body: formattedData.map(item => [
                item.productTitle,
                item.quantity,
                currencyFormatter.format(item.unitPrice),
                currencyFormatter.format(item.totalAmountLost),
                item.cancellationDate.toLocaleDateString("es-ES"),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] },
        });
        doc.save(`Reporte_Detallado_Perdidas_${new Date().toISOString().slice(0, 10)}.pdf`);
        messageApi.success("Reporte detallado generado en PDF.");
    };

    const getPieChartData = () => {
        const groupedData: { [key: string]: { quantity: number; amount: number; } } = {};
        formattedData.forEach(item => {
            if (!groupedData[item.productTitle]) {
                groupedData[item.productTitle] = { quantity: 0, amount: 0 };
            }
            groupedData[item.productTitle].quantity += item.quantity;
            groupedData[item.productTitle].amount += item.totalAmountLost;
        });

    let chartableItems = Object.entries(groupedData).map(([title, data]) => ({ title, ...data }));
        chartableItems.sort((a, b) => (sortChartBy === 'amount' ? b.amount - a.amount : b.quantity - a.quantity));
        
        const topNItems = chartableItems.slice(0, maxChartItems);
        const labels = topNItems.map(item => item.title);
        const data = topNItems.map(item => sortChartBy === 'amount' ? item.amount : item.quantity);

        const backgroundColors = ["#FF5F15", "#FF7F50", "#FFCE56", "#FFA500", "#FF5F1F", "#FF9F40", "#FF4433"];
        return {
            labels,
            datasets: [{
                label: sortChartBy === 'amount' ? 'Monto Perdido' : 'Cantidad Cancelada',
                data,
                backgroundColor: backgroundColors,
            }],
        };
    };
    const chartSortMenu = (
        <AntMenu onClick={({ key }) => setSortChartBy(key as 'quantity' | 'amount')}>
            <AntMenu.Item key="amount">Por monto</AntMenu.Item>
            <AntMenu.Item key="quantity">Por unidad</AntMenu.Item>
        </AntMenu>
    );

    const chartItemsMenu = (
        <AntMenu onClick={({ key }) => setMaxChartItems(parseInt(key))}>
            {[ 5, 10, 15].map(num => <AntMenu.Item key={num.toString()}>Top {num}</AntMenu.Item>)}
        </AntMenu>
    );
    if (loading) return <LoadingDinamico variant="fullScreen" />;

    if (!loading && productosPerdidos.length === 0) {
        return (
            <div className={`${styles.perdidasContainer} p-4 md:p-6`}>
                <Title level={2}>Análisis de Pérdidas por Producto</Title>
                <Empty description={<Text type="secondary">No se encontraron datos de pérdidas.</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-10" />
            </div>
        );
    }
    
    return (
        <div className= {`${styles.perdidasContainer} space-y-6 p-4 md:p-6`}>
            {contextHolder}
            <div className= "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <Title level={2} className="mb-1">
                        Perdidas por Producto
                    </Title>
                    <Text type="secondary">Generar reportes detallados (Excel o PDF)</Text>
                </div>
                <Space wrap>
                    <AntButton icon={<FileExcelOutlined />} onClick= {exportToExcel} className={styles.exportButtonExcel}>Generar Excel</AntButton>
                    <AntButton icon={<FilePdfOutlined />} onClick= {generatePDF} className={styles.exportButtonPdf}>Generar PDF</AntButton>
                </Space>
            </div>
            
            <Card className= "shadow-lg">
                <Row justify="center" align="middle" gutter={[16, 16]}>
                    <Col xs= {24} md= {12}>
                        <Statistic
                            title= "Monto total perdido"
                            value= {totalMontoGlobalPerdido}
                            formatter={(val) => currencyFormatter.format(val as number)}
                            valueStyle={{ color: '#cf1322', fontSize: '2rem' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Statistic
                            title="Productos cancelados (por unidad)"
                            value={totalUnidadesCanceladas}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#cf1322', fontSize: '2rem' }}
                        />
                    </Col>
                </Row>
                <Divider/>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <Title level={4} className="mb-0">Distribución por {sortChartBy === 'amount' ? 'Monto' : 'Cantidad'}</Title>
                    <Space>
                        <AntDropdown overlay={chartSortMenu} trigger={['click']}>
                            <AntButton>Ordenar por: {sortChartBy === 'amount' ? 'Monto' : 'Cantidad'} <DownOutlined /></AntButton>
                        </AntDropdown>
                        <AntDropdown overlay={chartItemsMenu} trigger={['click']}>
                            <AntButton>Mostrar: Top {maxChartItems} <DownOutlined /></AntButton>
                        </AntDropdown>
                    </Space>
                </div>
                <div className={styles.chartWrapper} style={{ height: '550px', maxWidth: '900px', margin: '0 auto' }}>
                   <Pie data={getPieChartData()} options={pieChartOptions} />
                </div>
            </Card>
        </div>
    );
}