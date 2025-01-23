import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./HomeSync.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faWarehouse, faPlug, faBriefcase, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const HomeSync: React.FC = () => {
    const cards = [
        { 
            title: "Productos", 
            description: "Gestiona todos los productos por negocio de Mercado Libre.", 
            icon: faBoxOpen, 
            link: "/sync/productos", 
            color: "bg-primary"
        },
        { 
            title: "Bodegas", 
            description: "Gestiona el inventario de tus productos.", 
            icon: faWarehouse, 
            link: "/sync/bodegas", 
            color: "bg-success"
        },
        { 
            title: "Conexiones a ML", 
            description: "Conecta nuevas cuentas de empresas a Mercado Libre.", 
            icon: faPlug, 
            link: "/sync/conexiones", 
            color: "bg-warning"
        },
        { 
            title: "Compañías", 
            description: "Gestiona las compañías asignadas a tus bodegas.", 
            icon: faBriefcase, 
            link: "/sync/companias", 
            color: "bg-danger"
        },
        { 
            title: "Reportes", 
            description: "Gestiona y exporta datos de tus productos.", 
            icon: faFolderOpen, 
            link: "/sync/reportes", 
            color: "bg-info"
        }
    ];

    return (
        <div className={`container ${styles.container}`}>
            <header className="mb-4 text-center">
                <h1>Panel de sincronización</h1>
                <h4 className="text-muted">Seleccione una opción:</h4>
            </header>
            <div className={`row g-3 ${styles.row}`}>
                {cards.map((card, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                        <Link to={card.link} className="text-decoration-none">
                            <div className={`card text-white ${card.color} h-100`}>
                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={card.icon} size="3x" />
                                    <h5 className="card-title mt-3">{card.title}</h5>
                                    <p className="card-text">{card.description}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeSync;
