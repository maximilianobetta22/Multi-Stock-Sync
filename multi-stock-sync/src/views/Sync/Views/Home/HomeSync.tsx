import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './HomeSync.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faWarehouse,
    faPlug,
  } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
const HomeSync: React.FC = () => {
/*
    const images = [
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
        'https://cloud.astronautmarkus.dev/index.php/apps/files_sharing/publicpreview/eCp8adJj7JEqCKf?file=/&fileId=1577&x=1920&y=1080&a=true&etag=07b5f2b0b34032b59ddd3ec4b60f6a1d',
    ];

  
    const chunkImages = (arr: string[], size: number) => {
        const result: string[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const groupedImages = chunkImages(images, 5); 
*/
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <br />
                <h1>Bienvenido a Multi Stock Sync</h1>
                <br />
                <p>Seleccione una opción para comenzar:</p>
            </div>
            <br />


            <div className={styles.buttonsContainer}>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faBoxOpen} size="5x" className={`${styles.icon} ${styles.iconProductos}`} />
                    <NavLink to={"/sync/productos"} className={`${styles.button} ${styles.productos}`}>Producto</NavLink>
                </div>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faWarehouse} size="5x" className={`${styles.icon} ${styles.iconBodega}`} />
                    <NavLink to={"/sync/bodegas"} className={`${styles.button} ${styles.bodega}`}>Bodega</NavLink>
                </div>
                <div className={styles.buttonWrapper}>
                    <FontAwesomeIcon icon={faPlug} size="5x" className={`${styles.icon} ${styles.iconConexiones}`} />
                    
                    <NavLink to={"/sync/perfil"} className={`${styles.button} ${styles.conexiones}`}>Conexiones a ML</NavLink>
                </div>
            </div>
            {/* Botones debajo del título 
            <div className={styles.buttonsContainer}>
                <button className={styles.button}>
                    <span>Productos</span><FontAwesomeIcon icon={faBoxOpen} />
                    <i className="bi bi-search"></i> Productos 
                </button>
                <button className={styles.button}>
                    <FontAwesomeIcon icon={faWarehouse} />
                    <i className="bi bi-heart"></i> Bodega
                </button>
                <button className={styles.button}>
                    <FontAwesomeIcon icon={faPlug} />
                    <i className="bi bi-cart"></i> Conexiones a Mercado Libre
                </button>
                
            </div>*/}

            <br />
            <br />
            
            {/* Primer Carrusel de Imágenes 
            <div id="carouselExampleIndicators1" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {groupedImages.map((group, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <div className="row justify-content-center">
                                {group.map((src, subIndex) => (
                                    <div key={subIndex} className="col-2 mb-3">
                                        <img
                                            src={src}
                                            alt={`Producto ${subIndex + 1}`}
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <a
                    className="carousel-control-prev"
                    href="#carouselExampleIndicators1"
                    role="button"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </a>
                <a
                    className="carousel-control-next"
                    href="#carouselExampleIndicators1"
                    role="button"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </a>
            </div>

            <br /> */}
            

            {/* Título para el segundo Carrusel 
            <div className={styles.header}>
                <h4>Descubre Más Productos</h4>
            </div>

            <br /> */}

            {/* Segundo Carrusel de Imágenes 
            <div id="carouselExampleIndicators2" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {groupedImages.map((group, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <div className="row justify-content-center">
                                {group.map((src, subIndex) => (
                                    <div key={subIndex} className="col-2 mb-3">
                                        <img
                                            src={src}
                                            alt={`Producto ${subIndex + 1}`}
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <a
                    className="carousel-control-prev"
                    href="#carouselExampleIndicators2"
                    role="button"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </a>
                <a
                    className="carousel-control-next"
                    href="#carouselExampleIndicators2"
                    role="button"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </a>
            </div>  */}
        </div> 
    );
};

export default HomeSync;
