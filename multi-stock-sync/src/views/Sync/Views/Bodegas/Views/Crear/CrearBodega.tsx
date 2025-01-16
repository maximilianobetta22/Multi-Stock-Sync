import React, { useState, useEffect } from 'react';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Company {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

const CrearBodega: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        assigned_company_id: ''
    });
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        axios.get(`${process.env.VITE_API_URL}/companies`)
            .then(response => {
                setCompanies(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching companies:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        axios.post(`${process.env.VITE_API_URL}/warehouses`, formData)
            .then(response => {
                console.log('Success:', response.data);
                setToastMessage('Bodega creada con éxito.');
                setToastType('success');
                setFormData({
                    name: '',
                    location: '',
                    assigned_company_id: ''
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error.response.data);
                setToastMessage('Datos inválidos.');
                setToastType('danger');
                setLoading(false);
            });
    };

    const closeToast = () => {
        setToastMessage(null);
    };

    if (loading) {
        return <LoadingDinamico variant='container' />;
    }

    return (
        <div className="container mt-5">
            <h1>Crear Bodega</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label">Ubicación de la bodega (opcional):</label>
                    <input type="text" className="form-control" id="location" name="location" value={formData.location} onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="assigned_company_id" className="form-label">Compañía Asignada:</label>
                    <select className="form-select" id="assigned_company_id" name="assigned_company_id" value={formData.assigned_company_id} onChange={handleChange} required>
                        <option value="">Seleccione una compañía</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary mx-2">Crear bodega</button>
                <Link to="../home" className="btn btn-danger">Volver</Link>
            </form>
            {toastMessage && (
                <div className={`toast show position-fixed bottom-0 end-0 m-3 bg-${toastType}`} role="alert" aria-live="assertive" aria-atomic="true">
                    <div className={`toast-header bg-${toastType}`}>
                        <strong className="me-auto" style={{ color: 'white' }}>MultiStock-Sync</strong>
                        <button type="button" className="btn-close" onClick={closeToast}></button>
                    </div>
                    <div className="toast-body" style={{ backgroundColor: 'white', color: 'black' }}>
                        {toastMessage}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearBodega;