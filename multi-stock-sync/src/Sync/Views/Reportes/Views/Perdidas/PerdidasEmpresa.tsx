import { useEffect, useState, useMemo, useCallback } from "react";
import {
    message,
    Card,
    Typography,
    Space,
    Empty,
    Select,
    Row,
    Col,
    Statistic,
    Button as AntButton,
} from "antd";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { CompanyMonthlyData, usePerdidasManagement, CancelledByMonth, Product } from "./usePerdidasManagement";
import styles from "./PerdidasEmpresa.module.css";
import { DollarCircleOutlined, CalendarOutlined, FilePdfOutlined, LineChartOutlined, FileExcelOutlined, ShopOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

interface ProcessedCompanyData {
    companyName: string;
    totalLost: number;
}

const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
});

export default function PerdidasEmpresa() {
    const { loading, error, fetchPerdidasPorMes } = usePerdidasManagement();
    const [isYearlyLoading, setIsYearlyLoading] = useState<boolean>(true);
    const [yearlyData, setYearlyData] = useState<CancelledByMonth | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchYearlyData = useCallback(async (year: number) => {
        setIsYearlyLoading(true);
        const allMonthsData: CancelledByMonth = {};

        try {
            for (let month = 1; month <= 12; month++) {
                const monthData = await fetchPerdidasPorMes(year, month);

                if (monthData?.cancelled_by_company) {
                    Object.assign(allMonthsData, monthData.cancelled_by_company);
                }
                await sleep(50); //el delay para que no se caiga la pagina (quitar si es muy molesto :p)
                setYearlyData(allMonthsData);
            }
        } catch (e) {
            console.error("Una o más llamadas mensuales fallaron:", e);
            messageApi.error("No se pudieron cargar todos los datos del año.");
            setYearlyData({});
        } finally {
            setIsYearlyLoading(false);
        }
    }, [fetchPerdidasPorMes, messageApi]);

    useEffect(() => {
        fetchYearlyData(selectedYear);
    }, [selectedYear, fetchYearlyData]);

    useEffect(() => {
        if (error) {
            messageApi.error(error);
        }
    }, [error, messageApi]);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

    const availableMonths = useMemo(() => {
        if (!yearlyData) return [];
        return Object.keys(yearlyData).sort((a, b) => b.localeCompare(a));
    }, [yearlyData]);

    const processedData = useMemo((): ProcessedCompanyData[] => {
        if (!yearlyData) return [];
        let monthlyData: CompanyMonthlyData[] = [];

        if (selectedMonth === 'all') {
            monthlyData = Object.values(yearlyData).flat();
        } else if (yearlyData[selectedMonth]) {
            monthlyData = yearlyData[selectedMonth];
        }

        const aggregatedData: { [companyName: string]: number } = {};
        monthlyData.forEach(company => {
            if (!aggregatedData[company.company_name]) {
                aggregatedData[company.company_name] = 0;
            }
            aggregatedData[company.company_name] += company.total_cancelled;
        });
        return Object.entries(aggregatedData)
            .map(([companyName, totalLost]) => ({ companyName, totalLost }))
            .sort((a, b) => b.totalLost - a.totalLost);
    }, [yearlyData, selectedMonth]);

    const totalPeriodoSeleccionado = processedData.reduce((sum, item) => sum + item.totalLost, 0);
    const totalAnualGlobal = useMemo(() => {
        if (!yearlyData) return 0;
        return Object.values(yearlyData).flat().reduce((sum, company) => sum + company.total_cancelled, 0);
    }, [yearlyData]);

    const top4Companies = useMemo(() => {
        return processedData.slice(0, 4);
    }, [processedData]);

    const chartData = {
        labels: processedData.map(item => item.companyName),
        datasets: [
            {
                label: `Perdida por compañia`,
                data: processedData.map(item => item.totalLost),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 6,
                pointHoverRadius: 9,
                tension: 0.1
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `Pérdida: ${currencyFormatter.format(context.parsed.y)}`
                }
            },
            datalabels: {
                display: false,
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: (value: any) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return currencyFormatter.format(value);
                    }
                }
            },
            x: {
                ticks: {
                    display: processedData.length <= 15,
                    autoSkip: true,

                }
            }
        }
    };

    const generatePdf = () => {
        if (processedData.length === 0) {
            messageApi.warning("No hay datos para exportar en el período seleccionado.");
            return;
        }

        const doc = new jsPDF();
        const tableTitle = 'Reporte de perdidas por compañia';
        const periodText = selectedMonth === 'all'
            ? `Año: ${selectedYear}`
            : `Período: ${new Date(selectedMonth + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;

        doc.setFontSize(18);
        doc.text(tableTitle, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de creación: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);
        doc.text(periodText, 14, 36);
        doc.text(`Total Perdido en Período: ${currencyFormatter.format(totalPeriodoSeleccionado)}`, 14, 42);

        const tableColumnNames = ["ID de Compañía", "Monto Total Perdido"];
        const tableRows = processedData.map(item => [
            item.companyName,
            currencyFormatter.format(item.totalLost)
        ]);

        autoTable(doc, {
            startY: 50,
            head: [tableColumnNames],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [207, 19, 34] },
        });
        const fileName = `Reporte_Perdidas_${selectedYear}_${selectedMonth}.pdf`;
        doc.save(fileName);

        messageApi.success("Reporte pdf generado correctamente")
    }

    const generateExcel = () => {
    if (processedData.length === 0) {
        messageApi.warning("No hay datos para exportar en el período seleccionado.");
        return;
    }

    let monthlyDataToProcess: CompanyMonthlyData[] = [];
    if (yearlyData) {
        if (selectedMonth === 'all') {
            monthlyDataToProcess = Object.values(yearlyData).flat();
        } else if (yearlyData[selectedMonth]) {
            monthlyDataToProcess = yearlyData[selectedMonth];
        }
    }

    const productsByCompany: { [companyName: string]: Product[] } = {};
    monthlyDataToProcess.forEach(companyData => {
        const companyName = companyData.company_name;
        if (!productsByCompany[companyName]) {
            productsByCompany[companyName] = [];
        }
        productsByCompany[companyName].push(...companyData.products);
    });

    const wb = XLSX.utils.book_new();

    const summaryData = processedData.map(item => ({
        'Compañía': item.companyName,
        'Pérdida Total (CLP)': item.totalLost
    }));
    summaryData.push({ 'Compañía': 'TOTAL GENERAL', 'Pérdida Total (CLP)': totalPeriodoSeleccionado });
    
    const ws_summary = XLSX.utils.json_to_sheet(summaryData);
    ws_summary['!cols'] = [{ wch: 35 }, { wch: 20 }];
    for (let i = 2; i <= summaryData.length + 1; i++) {
        const cellRef = 'B' + i;
        if (ws_summary[cellRef]) {
            ws_summary[cellRef].t = 'n';
            ws_summary[cellRef].z = '$#,##0';
        }
    }
    XLSX.utils.book_append_sheet(wb, ws_summary, "Resumen General");


    for (const companyName in productsByCompany) {
        const productList = productsByCompany[companyName];

        let companySheetData = productList.map(product => ({
            'Producto': product.title,
            'Cantidad': product.quantity,
            'Precio Unitario (CLP)': product.price,
            'Subtotal (CLP)': (product.quantity || 0) * (product.price || 0)
        }));

        const ws_company = XLSX.utils.json_to_sheet(companySheetData);

        ws_company['!cols'] = [{ wch: 50 }, { wch: 10 }, { wch: 20 }, { wch: 20 }];
        for (let i = 2; i <= companySheetData.length + 1; i++) {
            const priceCell = 'C' + i;
            const subtotalCell = 'D' + i;
            if (ws_company[priceCell] && typeof ws_company[priceCell].v === 'number') {
                ws_company[priceCell].t = 'n';
                ws_company[priceCell].z = '$#,##0';
            }
            if (ws_company[subtotalCell] && typeof ws_company[subtotalCell].v === 'number') {
                ws_company[subtotalCell].t = 'n';
                ws_company[subtotalCell].z = '$#,##0';
            }
        }

        const safeSheetName = companyName.replace(/[\/\\?*\[\]]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws_company, safeSheetName);
    }

    const fileName = `Reporte_Perdidas_Por_Tienda_${selectedYear}_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);

    messageApi.success("Reporte por tienda generado correctamente");
};

    if (isYearlyLoading) {
        return <LoadingDinamico variant="fullScreen" />;
    }

    return (
        <div className={`${styles.perdidasContainer} space-y-6 p-4 md:p-6`}>
            {contextHolder}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <AntTitle level={2} className="mb-1">
                            Reporte de Perdidas por Cancelación
                        </AntTitle>
                        <Text type="secondary">Analisis de perdidas por compañia y periodo.</Text>
                    </div>
                    <Space wrap>
                        <Select value={selectedYear} onChange={setSelectedYear}
                            style={{ width: 120 }}>
                            {yearOptions.map(year => <Option key={year} value={year}>{year}</Option>)}
                        </Select>
                        <Select
                            value={selectedMonth}
                            onChange={(value) => setSelectedMonth(value)}
                            style={{ width: 200 }}
                            disabled={isYearlyLoading}
                        >
                            <Option value="all">Todo el Año</Option>
                            {availableMonths.map(month => (
                                <Option key={month} value={month}>
                                    {new Date(month + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </Option>
                            ))}
                        </Select>
                        <AntButton
                            icon={<FilePdfOutlined />}
                            onClick={generatePdf}
                            disabled={loading || processedData.length === 0}
                        >
                            Exportar a PDF
                        </AntButton>
                        <AntButton
                            icon={<FileExcelOutlined />}
                            onClick={generateExcel}
                            disabled={loading || processedData.length === 0}
                        >
                            Exportar a Excel
                        </AntButton>
                    </Space>
                </div>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card bordered={false} className={styles.statsCard}>
                        <Statistic
                            title="Pérdida del Período Seleccionado"
                            value={totalPeriodoSeleccionado}
                            precision={0}
                            formatter={(value) => currencyFormatter.format(Number(value))}
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card bordered={false} className={styles.statsCard}>
                        <Statistic
                            title={`Pérdida Total Global (${selectedYear})`}
                            value={totalAnualGlobal}
                            precision={0}
                            formatter={(value) => currencyFormatter.format(Number(value))}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title={<><LineChartOutlined /> Gráfico de Pérdidas por Compañía</>} className="mt-4">
                        {loading && <LoadingDinamico />}
                        {!loading && processedData.length === 0 ? (
                            <Empty description="No hay datos para mostrar en el gráfico." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <div style={{ height: '400px', position: 'relative' }}>

                                <Line data={chartData} options={chartOptions as any} />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
            {top4Companies.length > 0 && (
                <Row className="mt-6">
                    <Col xs= {24}>
                    <AntTitle level={4} style={{ marginBottom: '16px'}}>
                        Top 4 compañias con mayores perdidas
                    </AntTitle>
                        <Row gutter={[16, 16]}>
                            {top4Companies.map((company) => (
                                <Col xs={24} sm={12} lg={6} key={company.companyName}>
                                    <Card bordered={false}>
                                        <Statistic
                                            title={company.companyName}
                                            value={company.totalLost}
                                            formatter={(value) => currencyFormatter.format(Number(value))}
                                            prefix={<ShopOutlined/>}
                                            valueStyle={{color: '#cf1322'}}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            )}
        </div>
    );
}