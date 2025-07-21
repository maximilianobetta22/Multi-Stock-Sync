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

// Cache para evitar llamadas repetitivas
const dataCache = new Map<string, CancelledByMonth>();

export default function PerdidasEmpresa() {
    const { loading, error, fetchPerdidasPorMes } = usePerdidasManagement();
    const [isYearlyLoading, setIsYearlyLoading] = useState<boolean>(false);
    const [yearlyData, setYearlyData] = useState<CancelledByMonth | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [loadingProgress, setLoadingProgress] = useState<number>(0);

    const fetchYearlyData = useCallback(async (year: number) => {
        const cacheKey = `year_${year}`;
        
        // Verificar cache primero
        if (dataCache.has(cacheKey)) {
            setYearlyData(dataCache.get(cacheKey)!);
            return;
        }

        setIsYearlyLoading(true);
        setLoadingProgress(0);
        
        try {
            // Crear todas las promesas de una vez (12 meses en paralelo)
            const monthPromises = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                return fetchPerdidasPorMes(year, month)
                    .then(data => ({ 
                        month: month.toString().padStart(2, '0') + '-01', // Formato consistente
                        data,
                        success: true 
                    }))
                    .catch(err => {
                        console.warn(`Error en mes ${month}:`, err);
                        return { 
                            month: month.toString().padStart(2, '0') + '-01', 
                            data: null, 
                            success: false 
                        };
                    });
            });

            // Esperar todas las promesas
            const results = await Promise.all(monthPromises);
            
            const allMonthsData: CancelledByMonth = {};
            let completedCount = 0;

            results.forEach((result) => {
                completedCount++;
                setLoadingProgress(Math.round((completedCount / 12) * 100));
                
                if (result.success && result.data?.cancelled_by_company) {
                    // En lugar de usar Object.assign, agregar datos mes por mes
                    const monthData = result.data.cancelled_by_company;
                    
                    // Procesar cada mes en la respuesta
                    Object.keys(monthData).forEach(monthKey => {
                        if (monthData[monthKey] && monthData[monthKey].length > 0) {
                            if (!allMonthsData[monthKey]) {
                                allMonthsData[monthKey] = [];
                            }
                            // Concatenar en lugar de sobrescribir
                            allMonthsData[monthKey] = allMonthsData[monthKey].concat(monthData[monthKey]);
                        }
                    });
                }
            });
            
            // Eliminar duplicados por compañía dentro de cada mes
            Object.keys(allMonthsData).forEach(monthKey => {
                const companies = new Map<string, CompanyMonthlyData>();
                
                allMonthsData[monthKey].forEach(company => {
                    const existing = companies.get(company.company_name);
                    if (existing) {
                        // Si ya existe, sumar los valores
                        existing.total_cancelled += company.total_cancelled;
                        existing.total_orders += company.total_orders;
                        existing.products = existing.products.concat(company.products);
                    } else {
                        companies.set(company.company_name, { ...company });
                    }
                });
                
                allMonthsData[monthKey] = Array.from(companies.values());
            });
            
            console.log('Datos cargados por mes:', Object.keys(allMonthsData).map(month => ({
                month,
                companies: allMonthsData[month].length,
                companyNames: allMonthsData[month].map(c => c.company_name)
            })));
            
            // Guardar en cache
            dataCache.set(cacheKey, allMonthsData);
            setYearlyData(allMonthsData);
            
        } catch (e) {
            console.error("Error al cargar datos del año:", e);
            messageApi.error("Error al cargar los datos del año.");
            setYearlyData({});
        } finally {
            setIsYearlyLoading(false);
            setLoadingProgress(0);
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

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 4 }, (_, i) => currentYear - i);
    }, []);

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

        console.log('Datos procesados:', {
            selectedMonth,
            totalCompanies: monthlyData.length,
            companies: monthlyData.map(c => c.company_name)
        });

        const aggregatedData = new Map<string, number>();
        
        monthlyData.forEach(company => {
            const currentTotal = aggregatedData.get(company.company_name) || 0;
            aggregatedData.set(company.company_name, currentTotal + company.total_cancelled);
        });

        const result = Array.from(aggregatedData.entries())
            .map(([companyName, totalLost]) => ({ companyName, totalLost }))
            .sort((a, b) => b.totalLost - a.totalLost);

        console.log('Resultado final:', result);
        return result;
    }, [yearlyData, selectedMonth]);

    const totalPeriodoSeleccionado = useMemo(() => {
        return processedData.reduce((sum, item) => sum + item.totalLost, 0);
    }, [processedData]);

    const totalAnualGlobal = useMemo(() => {
        if (!yearlyData) return 0;
        return Object.values(yearlyData).flat().reduce((sum, company) => sum + company.total_cancelled, 0);
    }, [yearlyData]);

    const top4Companies = useMemo(() => {
        return processedData.slice(0, 4);
    }, [processedData]);

    const chartData = useMemo(() => ({
        labels: processedData.map(item => item.companyName),
        datasets: [
            {
                label: `Perdida por compañía`,
                data: processedData.map(item => item.totalLost),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 6,
                pointHoverRadius: 9,
                tension: 0.1
            },
        ],
    }), [processedData]);

    const chartOptions = useMemo(() => ({
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
    }), [processedData.length]);

    const generatePdf = useCallback(() => {
        if (processedData.length === 0) {
            messageApi.warning("No hay datos para exportar en el período seleccionado.");
            return;
        }

        const doc = new jsPDF();
        const tableTitle = 'Reporte de perdidas por compañía';
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
        messageApi.success("Reporte pdf generado correctamente");
    }, [processedData, selectedMonth, selectedYear, totalPeriodoSeleccionado, messageApi]);

    const generateExcel = useCallback(() => {
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

        // Organizar productos por compañía
        const productsByCompany: { [companyName: string]: Product[] } = {};
        const companySummary: { [companyName: string]: CompanyMonthlyData[] } = {};
        
        monthlyDataToProcess.forEach(companyData => {
            const companyName = companyData.company_name;
            if (!productsByCompany[companyName]) {
                productsByCompany[companyName] = [];
                companySummary[companyName] = [];
            }
            productsByCompany[companyName].push(...companyData.products);
            companySummary[companyName].push(companyData);
        });

        const wb = XLSX.utils.book_new();

        // 1. HOJA DE PORTADA Y RESUMEN EJECUTIVO
        const coverData = [
            ['REPORTE DE PÉRDIDAS POR CANCELACIÓN'],
            [''],
            ['Información del Reporte'],
            ['Fecha de Generación:', new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })],
            ['Período Analizado:', selectedMonth === 'all' 
                ? `Año Completo ${selectedYear}` 
                : new Date(selectedMonth + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })],
            ['Total de Compañías:', processedData.length],
            [''],
            ['Resumen Financiero'],
            ['Total Pérdida Período:', totalPeriodoSeleccionado.toLocaleString('es-CL')],
            ['Total Pérdida Anual:', totalAnualGlobal.toLocaleString('es-CL')],
            ['Promedio por Compañía:', Math.round(totalPeriodoSeleccionado / processedData.length).toLocaleString('es-CL')],
            [''],
            ['Top 3 Compañías con Mayores Pérdidas'],
            ['Ranking', 'Compañía', 'Pérdida ', '% del Total'],
            ...processedData.slice(0, 3).map((item, index) => [
                index + 1,
                item.companyName,
                item.totalLost.toLocaleString('es-CL'),
                `${((item.totalLost / totalPeriodoSeleccionado) * 100).toFixed(1)}%`
            ])
        ];

        const ws_cover = XLSX.utils.aoa_to_sheet(coverData);
        ws_cover['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
        
        XLSX.utils.book_append_sheet(wb, ws_cover, "📊 Resumen Ejecutivo");

        // 2. HOJA DE RESUMEN DETALLADO POR COMPAÑÍAS
        const detailedSummaryData = processedData.map((item, index) => {
            const companyData = companySummary[item.companyName] || [];
            const totalOrders = companyData.reduce((sum, data) => sum + (data.total_orders || 0), 0);
            const totalProducts = productsByCompany[item.companyName]?.length || 0;
            
            return {
                'Ranking': index + 1,
                'Compañía': item.companyName,
                'Pérdida Total ': item.totalLost.toLocaleString('es-CL'),
                '% del Total': `${((item.totalLost / totalPeriodoSeleccionado) * 100).toFixed(2)}%`,
                'Órdenes Canceladas': totalOrders,
                'Productos Afectados': totalProducts,
                'Pérdida Promedio por Orden': totalOrders > 0 ? Math.round(item.totalLost / totalOrders).toLocaleString('es-CL') : 0,
                'Estado': item.totalLost > (totalPeriodoSeleccionado / processedData.length) ? 'Alto Riesgo' : 'Normal'
            };
        });

        // Agregar fila de totales
        detailedSummaryData.push({
            'Ranking': detailedSummaryData.length + 1, // Cambiar de '' a número
            'Compañía': '*** TOTAL GENERAL ***',
            'Pérdida Total ': totalPeriodoSeleccionado.toLocaleString('es-CL'),
            '% del Total': '100.00%',
            'Órdenes Canceladas': detailedSummaryData.reduce((sum, item) => 
                sum + (typeof item['Órdenes Canceladas'] === 'number' ? item['Órdenes Canceladas'] : 0), 0),
            'Productos Afectados': detailedSummaryData.reduce((sum, item) => 
                sum + (typeof item['Productos Afectados'] === 'number' ? item['Productos Afectados'] : 0), 0),
            'Pérdida Promedio por Orden': 'N/A', // Cambiar de '' a 'N/A'
            'Estado': 'TOTAL' // Cambiar de '' a 'TOTAL'
        });

        const ws_detailed = XLSX.utils.json_to_sheet(detailedSummaryData);
        ws_detailed['!cols'] = [
            { wch: 8 },  // Ranking
            { wch: 35 }, // Compañía
            { wch: 18 }, // Pérdida Total
            { wch: 12 }, // % del Total
            { wch: 15 }, // Órdenes
            { wch: 15 }, // Productos
            { wch: 20 }, // Promedio
            { wch: 12 }  // Estado
        ];

        XLSX.utils.book_append_sheet(wb, ws_detailed, "📈 Análisis Detallado");

        // 3. HOJA DE ANÁLISIS POR PRODUCTOS (TOP PRODUCTOS MÁS CANCELADOS)
        const allProducts: (Product & { companyName: string })[] = [];
        Object.entries(productsByCompany).forEach(([companyName, products]) => {
            products.forEach(product => {
                allProducts.push({ ...product, companyName });
            });
        });

        // Agrupar productos por título y calcular métricas
        const productAnalysis = new Map<string, {
            title: string;
            totalQuantity: number;
            totalLoss: number;
            companies: Set<string>;
            occurrences: number;
        }>();

        allProducts.forEach(product => {
            const key = product.title;
            const existing = productAnalysis.get(key);
            const productLoss = (product.quantity || 0) * (product.price || 0);
            
            if (existing) {
                existing.totalQuantity += product.quantity || 0;
                existing.totalLoss += productLoss;
                existing.companies.add(product.companyName);
                existing.occurrences += 1;
            } else {
                productAnalysis.set(key, {
                    title: product.title,
                    totalQuantity: product.quantity || 0,
                    totalLoss: productLoss,
                    companies: new Set([product.companyName]),
                    occurrences: 1
                });
            }
        });

        const topProductsData = Array.from(productAnalysis.values())
            .sort((a, b) => b.totalLoss - a.totalLoss)
            .slice(0, 50) // Top 50 productos
            .map((item, index) => ({
                'Ranking': index + 1,
                'Producto': item.title,
                'Cantidad Total Cancelada': item.totalQuantity,
                'Pérdida Total ': item.totalLoss.toLocaleString('es-CL'),
                'Compañías Afectadas': item.companies.size,
                'Frecuencia de Cancelación': item.occurrences,
                'Pérdida Promedio por Cancelación': Math.round(item.totalLoss / item.occurrences).toLocaleString('es-CL'),
                'Compañías': Array.from(item.companies).join(', ')
            }));

        const ws_products = XLSX.utils.json_to_sheet(topProductsData);
        ws_products['!cols'] = [
            { wch: 8 },  // Ranking
            { wch: 50 }, // Producto
            { wch: 12 }, // Cantidad
            { wch: 18 }, // Pérdida
            { wch: 12 }, // Compañías
            { wch: 12 }, // Frecuencia
            { wch: 20 }, // Promedio
            { wch: 40 }  // Lista compañías
        ];

        XLSX.utils.book_append_sheet(wb, ws_products, "🛍️ Top Productos Cancelados");

        // 4. HOJAS INDIVIDUALES POR COMPAÑÍA (solo para las top 10)
        const topCompanies = processedData.slice(0, 10);
        
        topCompanies.forEach((company, companyIndex) => {
            const companyName = company.companyName;
            const productList = productsByCompany[companyName] || [];
            const companyData = companySummary[companyName] || [];
            
            // Información de la compañía
            const companyInfo = [
                [`*** ANÁLISIS DETALLADO - ${companyName.toUpperCase()} ***`],
                [''],
                ['=== MÉTRICAS PRINCIPALES ==='],
                ['Pérdida Total:', company.totalLost.toLocaleString('es-CL')],
                ['Ranking General:', companyIndex + 1],
                ['% del Total Global:', `${((company.totalLost / totalPeriodoSeleccionado) * 100).toFixed(2)}%`],
                ['Total de Productos:', productList.length],
                ['Órdenes Canceladas:', companyData.reduce((sum, data) => sum + (data.total_orders || 0), 0)],
                [''],
                ['=== DETALLE DE PRODUCTOS CANCELADOS ==='],
                ['Producto', 'Cantidad', 'Precio Unit. ', 'Subtotal ', '% de Pérdida de la Compañía']
            ];

            const productDetails = productList
                .sort((a, b) => ((b.quantity || 0) * (b.price || 0)) - ((a.quantity || 0) * (a.price || 0)))
                .map(product => {
                    const subtotal = (product.quantity || 0) * (product.price || 0);
                    return [
                        product.title,
                        product.quantity || 0,
                        (product.price || 0).toLocaleString('es-CL'),
                        subtotal.toLocaleString('es-CL'),
                        `${((subtotal / company.totalLost) * 100).toFixed(1)}%`
                    ];
                });

            const companySheetData = [...companyInfo, ...productDetails];
            const ws_company = XLSX.utils.aoa_to_sheet(companySheetData);
            
            ws_company['!cols'] = [{ wch: 50 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];

            const safeSheetName = `${companyIndex + 1}. ${companyName.replace(/[\/\\?*\[\]]/g, '').substring(0, 25)}`;
            XLSX.utils.book_append_sheet(wb, ws_company, safeSheetName);
        });

        // 5. HOJA DE ANÁLISIS TEMPORAL (si es año completo)
        if (selectedMonth === 'all' && yearlyData) {
            const monthlyAnalysis = Object.entries(yearlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, companies]) => {
                    const monthTotal = companies.reduce((sum, company) => sum + company.total_cancelled, 0);
                    const monthOrders = companies.reduce((sum, company) => sum + (company.total_orders || 0), 0);
                    
                    return {
                        'Mes': new Date(month + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
                        'Pérdida Total ': monthTotal.toLocaleString('es-CL'),
                        'Compañías Afectadas': companies.length,
                        'Órdenes Canceladas': monthOrders,
                        'Promedio por Compañía': companies.length > 0 ? Math.round(monthTotal / companies.length).toLocaleString('es-CL') : 0,
                        'Promedio por Orden': monthOrders > 0 ? Math.round(monthTotal / monthOrders).toLocaleString('es-CL') : 0
                    };
                });

            const ws_temporal = XLSX.utils.json_to_sheet(monthlyAnalysis);
            ws_temporal['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];

            XLSX.utils.book_append_sheet(wb, ws_temporal, "📅 Análisis Temporal");
        }

        // Generar archivo
        const periodSuffix = selectedMonth === 'all' ? 'Anual' : new Date(selectedMonth + '-02').toLocaleDateString('es-ES', { month: 'short' });
        const fileName = `Reporte_Perdidas_Detallado_${selectedYear}_${periodSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        messageApi.success(`Reporte detallado generado: ${fileName}`);
    }, [processedData, yearlyData, selectedMonth, selectedYear, totalPeriodoSeleccionado, totalAnualGlobal, messageApi]);

    if (isYearlyLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoadingDinamico variant="fullScreen" />
                {loadingProgress > 0 && (
                    <div className="mt-4 text-center">
                        <p>Cargando datos del año... {loadingProgress}%</p>
                        <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        );
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
                        <Text type="secondary">
                            Análisis de perdidas por compañía y periodo. 
                            {processedData.length > 0 && ` (${processedData.length} compañías)`}
                        </Text>
                    </div>
                    <Space wrap>
                        <Select 
                            value={selectedYear} 
                            onChange={setSelectedYear}
                            style={{ width: 120 }}
                        >
                            {yearOptions.map(year => (
                                <Option key={year} value={year}>{year}</Option>
                            ))}
                        </Select>
                        <Select
                            value={selectedMonth}
                            onChange={setSelectedMonth}
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
                    <Col xs={24}>
                        <AntTitle level={4} style={{ marginBottom: '16px'}}>
                            Top 4 compañías con mayores pérdidas
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

/**
 * ===============================================================================
 * COMPONENTE REPORTE DE PERDIAS
 * ===============================================================================
 
 * FUNCIONALIDADES PRINCIPALES:
 * ----------------------------
 * 
 * ANÁLISIS DE DATOS:
 * - Carga datos de cancelaciones por mes/año con sistema de cache
 * - Procesa y agrega información de múltiples compañías
 * - Calcula métricas financieras y estadísticas de rendimiento
 * - Identifica patrones de cancelación y productos problemáticos
 * 

 * FILTROS Y NAVEGACIÓN:
 * - Selector de año (últimos 4 años disponibles)
 * - Filtro por mes específico o análisis anual completo
 * - Actualización automática de datos al cambiar filtros
 * - Sistema de cache para optimizar rendimiento
 * 
 * REPORTES EXPORTABLES:
 * 
 * PDF Simple:
 * - Tabla básica con ranking de compañías y pérdidas
 * - Información del período y totales generales
 * - Formato corporativo con headers personalizados
 * 
 * Excel (5 hojas especializadas):
 * ┌─  Resumen Ejecutivo: Portada con métricas clave y Top 3
 * ├─  Análisis Detallado: Ranking completo con KPIs por compañía
 * ├─ Top Productos: Los 50 productos más cancelados con análisis
 * ├─  Hojas Individuales: Análisis detallado de Top 10 compañías
 * └─  Análisis Temporal: Evolución mensual (solo reportes anuales)
 * 
 *  MÉTRICAS CALCULADAS:
 * - Pérdida total por compañía y período
 * - Porcentaje de participación en pérdidas totales
 * - Promedio de pérdida por orden cancelada
 * - Frecuencia de cancelaciones por producto
 * - Clasificación de riesgo (Alto Riesgo/Normal)
 * - Análisis de productos más problemáticos
 * - Evolución temporal de cancelaciones
 * 
 *  OPTIMIZACIONES TÉCNICAS:
 * - Cache inteligente para evitar llamadas API repetitivas

 *  DEPENDENCIAS PRINCIPALES:
 * - React (hooks: useState, useEffect, useMemo, useCallback)
 * - Ant Design 
 * - Chart.js + react-chartjs-2 (visualización de gráficos)
 * - jsPDF + jspdf-autotable (generación de PDFs)
 * - SheetJS (xlsx) (generación de archivos Excel)
 * - Custom hook: usePerdidasManagement 
 * 


 * ===============================================================================
 */