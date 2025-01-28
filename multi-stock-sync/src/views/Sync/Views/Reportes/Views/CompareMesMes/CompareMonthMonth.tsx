import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import axios from 'axios';
import styles from './CompareMonthMonth.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const months: { [key: string]: string } = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre"
};

const orderedMonths = Object.entries(months).sort(([a], [b]) => parseInt(a) - parseInt(b));

const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const CompareMonthMonth: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [year1, setYear1] = useState('');
    const [month1, setMonth1] = useState('');
    const [year2, setYear2] = useState('');
    const [month2, setMonth2] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        const fetchNickname = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
                console.log('Nickname response:', response.data); // Debugging statement
                setNickname(response.data.data.nickname); // Correct path to nickname
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNickname();
    }, [client_id]);

    const handleDropdownChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/compare-sales-data/${client_id}`, {
                params: { year1, month1, year2, month2 }
            });
            setResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <LoadingDinamico variant="container" />}
            <div className={styles.container} style={{ display: loading ? 'none' : 'block' }}>
                {!loading && (
                    <>
                        <h1>Comparar Ventas entre Meses</h1>
                        <p>USUARIO: {nickname}</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Año 1</label>
                                <select className="form-control" value={year1} onChange={handleDropdownChange(setYear1)} required>
                                    <option value="">Seleccione un año</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mes 1</label>
                                <select className="form-control" value={month1} onChange={handleDropdownChange(setMonth1)} required>
                                    <option value="">Seleccione un mes</option>
                                    {orderedMonths.map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Año 2</label>
                                <select className="form-control" value={year2} onChange={handleDropdownChange(setYear2)} required>
                                    <option value="">Seleccione un año</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mes 2</label>
                                <select className="form-control" value={month2} onChange={handleDropdownChange(setMonth2)} required>
                                    <option value="">Seleccione un mes</option>
                                    {orderedMonths.map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.buttonContainer}>
                                <button type="submit" className="btn btn-primary">Comparar</button>
                            </div>
                        </form>
                        {result && (
                            <div>
                                <h1>Resultado de la Comparación</h1>
                                <div className={styles.tableContainer}>
                                    <h3>{months[result.data.month1.month]} {result.data.month1.year}</h3>
                                    <p>Total Ventas: <strong>{formatCurrency(result.data.month1.total_sales)}</strong></p>
                                    <div className={styles.tableContainer}>
                                        <table className={`table table-striped ${styles.table}`}>
                                            <thead>
                                                <tr>
                                                    <th className='table_header'>Producto</th>
                                                    <th className='table_header'>Cantidad</th>
                                                    <th className='table_header'>Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data.month1.sold_products.map((product: any) => (
                                                    <tr key={product.order_id}>
                                                        <td>{product.title}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{formatCurrency(product.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className={styles.tableContainer}>
                                    <h3>{months[result.data.month2.month]} {result.data.month2.year}</h3>
                                    <p>Total Ventas: <strong>{formatCurrency(result.data.month2.total_sales)}</strong></p>
                                    <div className={styles.tableContainer}>
                                        <table className={`table table-striped ${styles.table}`}>
                                            <thead>
                                                <tr>
                                                    <th className='table_header'>Producto</th>
                                                    <th className='table_header'>Cantidad</th>
                                                    <th className='table_header'>Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data.month2.sold_products.map((product: any) => (
                                                    <tr key={product.order_id}>
                                                        <td>{product.title}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{formatCurrency(product.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <p>Diferencia: <strong>{formatCurrency(result.data.difference)}</strong></p>
                                <p style={{ color: result.data.percentage_change > 0 ? 'green' : 'red' }}>
                                    Cambio Porcentual: <strong>{result.data.percentage_change}%</strong>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default CompareMonthMonth;