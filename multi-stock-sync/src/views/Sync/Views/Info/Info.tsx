import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Info.module.css';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';
import { Link } from 'react-router-dom';

const Info: React.FC = () => {
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/info`);
                setInfo(response.data);
            } catch (error) {
                console.error('Error fetching info:', error);
            }
        };

        fetchInfo();
    }, []);

    return (
        <>
            {!info && <LoadingDinamico variant="container" />}
            <div className={`container ${styles['info-container']}`}>
                {info && (
                    <div className="row">
                        <h1 className="mb-4">Información del sistema</h1>
                        <div className="col-md-6">
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Estado de la API</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.status}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Uptime del servidor</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.uptime}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Estado de la base de datos</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.database_status}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Estado de caché</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.cache_status}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Estado de Redis</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.redis_status}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Estado de la cola</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.queue_status}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Uso de memoria</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>{info.memory_usage.memory_usage}</p>
                                    <p className={`card-text ${styles['info-card-text']}`}>Memory Limit: {info.memory_usage.memory_limit}</p>
                                </div>
                            </div>
                            <div className={`card ${styles['info-card']}`}>
                                <div className="card-body">
                                    <h5 className={`card-title ${styles['info-card-title']}`}>Espacio utilizado</h5>
                                    <p className={`card-text ${styles['info-card-text']}`}>Total: {info.disk_space.total}</p>
                                    <p className={`card-text ${styles['info-card-text']}`}>Free: {info.disk_space.free}</p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                )}
                <Link to={"/sync/home"} className={`btn btn-primary mt-4 mb-5 ${!info ? 'd-none' : ''}`}>Volver a inicio</Link>
            </div>
        </>
    );
};

export default Info;