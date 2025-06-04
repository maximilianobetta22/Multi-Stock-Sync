import React, { useEffect, useState, useRef } from "react";
import {
    Table,
    message,
    Tag,
    Input,
    Card,
    Typography,
    Space,
    Empty,
    Button as AntButton,
    Dropdown as AntDropdown,
    Menu as AntMenu,
    Modal,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    DownOutlined,
} from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title as ChartTitle, CategoryScale, LinearScale, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { usePerdidasManagement, CancelledProductItem } from "../../../GestionEnvios/Hooks/usePerdidasManagement";
import styles from "./PerdidasEmpresa.module.css";

ChartJS.register(ArcElement, Tooltip, Legend, ChartTitle, ChartDataLabels, CategoryScale, LinearScale);

const { Title, Text } = Typography;
const { Search } = Input;

// Interfaz para los datos formateados de la tabla y el gráfico
interface FormattedProductLoss {
    key: string | number;
    id: number;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalAmountLost: number;
    cancellationDate: string;
    status: string;
}

export default function PerdidasEmpresa() {
    const {
        productosPerdidos,
        totalMontoGlobalPerdido,
        loading,
        error,
        fetchPerdidasEmpresa,
    } = usePerdidasManagement();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchText, setSearchText] = React.useState<string>("");

    // Estados para el gráfico
    const [maxChartItems, setMaxChartItems] = useState(10);
    const [sortChartBy, setSortChartBy] = useState<'quantity' | 'amount'>('amount');

    // Estados para PDF
    const pdfRef = useRef<jsPDF | null>(null);
    const [showPDFModal, setShowPDFModal] = React.useState<boolean>(false);
    const [pdfDataUri] = React.useState<string | null>(null);

    useEffect(() => {
        fetchPerdidasEmpresa();
    }, []);

    useEffect(() => {
        if (error) {
            messageApi.error(error);
        }
    }, [error, messageApi]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const formattedData: FormattedProductLoss[] = React.useMemo(() => {
        return productosPerdidos
            .map((item: CancelledProductItem) => ({
                key: item.id,
                id: item.id,
                productTitle: item.product?.title || "N/A",
                quantity: item.product?.quantity || 0,
                unitPrice: item.product?.price || 0,
                totalAmountLost: item.total_amount || 0,
                cancellationDate: item.created_date,
                status: item.status,
            }))
            .filter((item) =>
                item.productTitle.toLowerCase().includes(searchText)
            );
    }, [productosPerdidos, searchText]);

    const totalItemsEnTabla = formattedData.length;
    const montoTotalEnTabla = formattedData.reduce((sum, item) => sum + item.totalAmountLost, 0);

    const currencyFormatter = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    });

    const columns: ColumnsType<FormattedProductLoss> = [
        {
            title: "Producto",
            dataIndex: "productTitle",
            key: "productTitle",
            sorter: (a: FormattedProductLoss, b: FormattedProductLoss) => a.productTitle.localeCompare(b.productTitle),
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Cantidad",
            dataIndex: "quantity",
            key: "quantity",
            align: "center" as const,
            sorter: (a: FormattedProductLoss, b: FormattedProductLoss) => a.quantity - b.quantity,
            render: (quantity: number) => <Tag color="blue">{quantity} uds.</Tag>,
        },
        {
            title: "Precio Unitario",
            dataIndex: "unitPrice",
            key: "unitPrice",
            align: "right" as const,
            sorter: (a: FormattedProductLoss, b: FormattedProductLoss) => a.unitPrice - b.unitPrice,
            render: (price: number) => <Text>{currencyFormatter.format(price)}</Text>,
        },
        {
            title: "Monto Perdido",
            dataIndex: "totalAmountLost",
            key: "totalAmountLost",
            align: "right" as const,
            sorter: (a: FormattedProductLoss, b: FormattedProductLoss) => a.totalAmountLost - b.totalAmountLost,
            render: (total: number) => (
                <Text strong style={{ color: '#fa541c' }}> {/* AntD color 'volcano-6' */}
                    {currencyFormatter.format(total)}
                </Text>
            ),
        },
        {
            title: "Fecha Cancelación",
            dataIndex: "cancellationDate",
            key: "cancellationDate",
            sorter: (a: FormattedProductLoss, b: FormattedProductLoss) => new Date(a.cancellationDate).getTime() - new Date(b.cancellationDate).getTime(),
            render: (date: string) => {
                const formattedDate = new Date(date).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
                return (
                    <Space>
                        <CalendarOutlined />
                        <Text>{formattedDate}</Text>
                    </Space>
                );
            },
        },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            filters: [{ text: 'Cancelado', value: 'cancelled' }], // Texto del filtro en español
            onFilter: (value: unknown, record: FormattedProductLoss): boolean => {
                // value vendrá de filter.value, que es 'cancelled' (string)
                if (typeof value === 'string') {
                    return record.status.toLowerCase().includes(value.toLowerCase());
                }
                return false;
            },
            render: (status: string) => (
                <Tag color="volcano" icon={<CloseCircleOutlined />}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    // --- Funciones de Exportación ---
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            formattedData.map(item => ({
                "ID": item.id,
                "Producto": item.productTitle,
                "Cantidad Cancelada": item.quantity,
                "Precio Unitario (CLP)": item.unitPrice,
                "Monto Perdido (CLP)": item.totalAmountLost,
                "Fecha Cancelación": new Date(item.cancellationDate).toLocaleDateString("es-ES"),
                "Estado": item.status,
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PerdidasPorCancelacion");
        XLSX.writeFile(workbook, `Reporte_Perdidas_Cancelacion_${new Date().toISOString().slice(0, 10)}.xlsx`);
        messageApi.success("Reporte exportado a Excel correctamente.");
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        pdfRef.current = doc;

        doc.setFontSize(18);
        doc.text("Reporte de Pérdidas por Cancelación", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        doc.text(`Fecha de Generación: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);
        doc.text(`Total Productos Cancelados (en reporte): ${totalItemsEnTabla}`, 14, 36);
        doc.text(`Monto Total Perdido (en reporte): ${currencyFormatter.format(montoTotalEnTabla)}`, 14, 42);
        doc.text(`Monto Total Global Perdido (API): ${currencyFormatter.format(totalMontoGlobalPerdido)}`, 14, 48);


        const tableColumnNames = ["Producto", "Cantidad", "Precio Unit.", "Monto Perdido", "Fecha Cancel."];
        const tableRows = formattedData.map(item => [
            item.productTitle,
            item.quantity,
            currencyFormatter.format(item.unitPrice),
            currencyFormatter.format(item.totalAmountLost),
            new Date(item.cancellationDate).toLocaleDateString("es-ES"),
        ]);

        autoTable(doc, {
            startY: 55,
            head: [tableColumnNames],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] }, // Un color verde azulado
            didDrawPage: function (data) {
                // Footer
                doc.setFontSize(10);
                doc.text("Página " + doc.internal.pages.length, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`Reporte_Perdidas_Cancelacion_${new Date().toISOString().slice(0, 10)}.pdf`);
        messageApi.success("Reporte PDF generado y descargado.");
    };

    // --- Lógica del Gráfico ---
    const getChartData = () => {
        if (formattedData.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Agrupar por producto y sumar cantidades o montos
        const groupedData: { [key: string]: { quantity: number; amount: number; count: number } } = {};
        formattedData.forEach(item => {
            if (!groupedData[item.productTitle]) {
                groupedData[item.productTitle] = { quantity: 0, amount: 0, count: 0 };
            }
            groupedData[item.productTitle].quantity += item.quantity;
            groupedData[item.productTitle].amount += item.totalAmountLost;
            groupedData[item.productTitle].count += 1;
        });

        let chartableItems = Object.entries(groupedData).map(([title, data]) => ({
            title,
            ...data,
        }));

        // Ordenar
        chartableItems.sort((a, b) => {
            if (sortChartBy === 'amount') return b.amount - a.amount;
            return b.quantity - a.quantity;
        });

        const topNItems = chartableItems.slice(0, maxChartItems);
        const totalValueForChart = topNItems.reduce((sum, item) => sum + (sortChartBy === 'amount' ? item.amount : item.quantity), 0);

        if (totalValueForChart === 0) {
            return {
                labels: topNItems.map(p => `${p.title} (0)`),
                datasets: [{
                    data: topNItems.map(() => 1), // Para que se vea algo si todo es 0
                    backgroundColor: ['rgba(200, 200, 200, 0.2)'],
                    borderColor: ['rgba(200, 200, 200, 1)'],
                }]
            };
        }

        const backgroundColors = [
            "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)",
            "rgba(201, 203, 207, 0.6)", "rgba(138, 43, 226, 0.6)", "rgba(0, 128, 0, 0.6)", "rgba(255, 0, 255, 0.6)"
        ];
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));


        return {
            labels: topNItems.map(item => item.title),
            datasets: [
                {
                    label: sortChartBy === 'amount' ? 'Monto Perdido' : 'Cantidad Cancelada',
                    data: topNItems.map(item => sortChartBy === 'amount' ? item.amount : item.quantity),
                    backgroundColor: backgroundColors.slice(0, topNItems.length),
                    borderColor: borderColors.slice(0, topNItems.length),
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Top ${maxChartItems} Productos con Más Pérdidas (por ${sortChartBy === 'amount' ? 'Monto' : 'Cantidad'})`,
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed;
                        if (value !== null && value !== undefined) {
                            if (sortChartBy === 'amount') {
                                label += currencyFormatter.format(value);
                            } else {
                                label += value + ' uds.';
                            }
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                formatter: (value: number, _context: any) => {
                    if (sortChartBy === 'amount') {
                        return currencyFormatter.format(value);
                    }
                    return value + ' uds.';
                },
                color: (context: any) => {
                    const bgColor = context.dataset.backgroundColor[context.dataIndex];
                    // Simple check for light/dark background (puede necesitar ajuste)
                    const colorParts = bgColor.substring(bgColor.indexOf('(') + 1, bgColor.lastIndexOf(')')).split(/,\s*/);
                    const r = parseInt(colorParts[0]);
                    const g = parseInt(colorParts[1]);
                    const b = parseInt(colorParts[2]);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    return brightness > 155 ? '#000000' : '#FFFFFF'; // Negro para fondos claros, blanco para oscuros
                },
                padding: 4,
                font: {
                    weight: 'bold' as const,
                    size: 10,
                },
                anchor: 'end',
                align: 'start',
                display: 'auto'
            }
        },
    };

    const chartSortMenu = (
        <AntMenu onClick={({ key }) => setSortChartBy(key as 'quantity' | 'amount')}>
            <AntMenu.Item key="amount" className={sortChartBy === 'amount' ? styles.activeMenuItem : ""}>Por Monto Perdido</AntMenu.Item>
            <AntMenu.Item key="quantity" className={sortChartBy === 'quantity' ? styles.activeMenuItem : ""}>Por Cantidad Cancelada</AntMenu.Item>
        </AntMenu>
    );

    const chartItemsMenu = (
        <AntMenu onClick={({ key }) => setMaxChartItems(parseInt(key))}>
            {[5, 10, 15, 20].map(num => (
                <AntMenu.Item key={num.toString()} className={maxChartItems === num ? styles.activeMenuItem : ""}>Top {num}</AntMenu.Item>
            ))}
        </AntMenu>
    );


    if (loading && productosPerdidos.length === 0) {
        return <LoadingDinamico variant="fullScreen" />;
    }

    return (
        <div className={`${styles.perdidasContainer} space-y-6 p-4 md:p-6`}>
            {contextHolder}

            <Card className={styles.statsCardContainer}>
                {/* ... (sin cambios en Estadísticas) ... */}
            </Card>

            <Card className="shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <Title level={2} className="mb-1">
                            💸 Registro de Pérdidas por Cancelaciones
                        </Title>
                        <Text type="secondary">Análisis de productos cancelados y el impacto económico.</Text>
                    </div>
                    <Space wrap>
                        <AntButton icon={<FileExcelOutlined />} onClick={exportToExcel} className={styles.exportButtonExcel}>
                            Exportar Excel
                        </AntButton>
                        <AntButton icon={<FilePdfOutlined />} onClick={generatePDF} className={styles.exportButtonPdf}>
                            Generar PDF
                        </AntButton>
                    </Space>
                </div>

                <Search
                    placeholder="Buscar por nombre de producto..."
                    onChange={handleSearch}
                    style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}
                    size="large"
                    prefix={<SearchOutlined />}
                    allowClear
                />

                {/* Se elimina el LoadingDinamico que estaba aquí */}
                {!loading && formattedData.length === 0 && !searchText ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span className="text-gray-500">No hay datos de pérdidas para mostrar.</span>}
                    />
                ) : (
                    <Table
                        loading={loading}
                        dataSource={formattedData}
                        columns={columns}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ítems`,
                            position: ['bottomRight']
                        }}
                        className="custom-table"
                        scroll={{ x: 800 }}
                        locale={{
                            emptyText: searchText
                                ? <Text>No se encontraron productos que contengan "<Text strong>{searchText}</Text>"</Text>
                                : <Text>No hay pérdidas registradas.</Text>,
                        }}
                        rowClassName={(_record, index) => index % 2 === 0 ? styles.evenRow : styles.oddRow}
                    />
                )}
            </Card>

            {!loading && productosPerdidos.length > 0 && (
                <Card className="shadow-lg mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Title level={3} className="mb-1">Gráfico de Productos con Pérdidas</Title>
                        <Space>
                            <AntDropdown overlay={chartSortMenu}>
                                <AntButton>
                                    Ordenar por: {sortChartBy === 'amount' ? 'Monto' : 'Cantidad'} <DownOutlined />
                                </AntButton>
                            </AntDropdown>
                            <AntDropdown overlay={chartItemsMenu}>
                                <AntButton>
                                    Mostrar: Top {maxChartItems} <DownOutlined />
                                </AntButton>
                            </AntDropdown>
                        </Space>
                    </div>
                    <div className={styles.chartWrapper} style={{ height: '450px', position: 'relative' }}>
                        {formattedData.length > 0 && getChartData().datasets.length > 0 ? ( 
                            <Pie data={getChartData()} options={chartOptions} /> 
                        ) : (
                            <Empty description="No hay datos suficientes para el gráfico." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                </Card>
            )}


            {showPDFModal && pdfDataUri && (
                <Modal
                    title="Vista Previa PDF"
                    visible={showPDFModal}
                    onCancel={() => setShowPDFModal(false)}
                    footer={null} // O botones para descargar/cerrar
                    width="80%"
                    bodyStyle={{ height: '70vh' }}
                >
                    <iframe src={pdfDataUri} width="100%" height="100%" title="Vista Previa PDF"></iframe>
                </Modal>
            )}
        </div>
    );
}