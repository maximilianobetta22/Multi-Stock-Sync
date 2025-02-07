import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./editarCompania.module.css";
import { Link } from "react-router-dom";

interface Company {
    id: number;
    name: string;
}

const EditarCompania: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [newCompanyName, setNewCompanyName] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [sortKey, setSortKey] = useState<keyof Company>("name");

    const fetchCompanies = async () => {
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/companies`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            } else {
                console.error("Error al obtener compañías");
            }
        } catch (error) {
            console.error("Error al obtener compañías:", error);
        }
    };    

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/companies`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    setCompanies(data);
                } else {
                    console.error("Error al obtener compañías");
                }
            } catch (error) {
                console.error("Error al obtener compañías:", error);
            }
        };
        fetchCompanies();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewCompanyName(event.target.value);
    };

    const handleEditClick = (company: Company) => {
        setEditingCompany(company);
        setNewCompanyName(company.name);
        document.getElementById("edit-form")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSaveChanges = async () => {
        if (!newCompanyName.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Nombre inválido",
                text: "Por favor ingresa un nombre válido.",
            });
            return;
        }

        if (editingCompany) {
            const updatedCompany = { ...editingCompany, name: newCompanyName };

            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/companies/${editingCompany.id}`;
                const response = await fetch(apiUrl, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedCompany),
                });

                if (response.ok) {
                    const updatedData = await response.json();
                    Swal.fire({
                        icon: "success",
                        title: "¡Éxito!",
                        text: "Compañía actualizada con éxito.",
                    });
                    setCompanies((prevCompanies) =>
                        prevCompanies.map((company) =>
                            company.id === updatedData.id ? updatedData : company
                        )
                    );
                    fetchCompanies();
                    setEditingCompany(null);
                    setNewCompanyName("");
                } else {
                    const errorResponse = await response.json();
                    Swal.fire({
                        icon: "error",
                        title: "Error al actualizar",
                        text: errorResponse.message || "Hubo un problema al guardar los cambios.",
                    });
                }
            } catch (error) {
                console.error("Error al actualizar la compañía:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo conectar con la API.",
                });
            }
        }
    };

    const handleDelete = async (company: Company) => {
        const confirmResult = await Swal.fire({
            title: "¿Estás seguro?",
            text: `¿Deseas eliminar la compañía "${company.name}"? Esta acción no se puede deshacer, además eliminará todas las bodegas relacionadas a esta compañía.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirmResult.isConfirmed) {
            Swal.fire({
                icon: "warning",
                title: "¿Estás seguro de esta acción?",
                html: "<strong>Una vez realizada, no se puede volver atrás.</strong>",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            }).then(async (secondConfirmResult) => {
                if (secondConfirmResult.isConfirmed) {
                    try {
                        const apiUrl = `${import.meta.env.VITE_API_URL}/companies/${company.id}`;
                        const response = await fetch(apiUrl, {
                            method: "DELETE",
                        });
        
                        if (response.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Eliminado",
                                text: "La compañía fue eliminada con éxito.",
                            });
                            setCompanies((prevCompanies) =>
                                prevCompanies.filter((c) => c.id !== company.id)
                            );
                            fetchCompanies();
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error al eliminar",
                                text: "No se pudo eliminar la compañía. Intenta nuevamente.",
                            });
                        }
                    } catch (error) {
                        console.error("Error al eliminar la compañía:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo conectar con la API.",
                        });
                    }
                }
            });
        }        
    };

    const handleSort = (key: keyof Company) => {
        const order = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(order);
        setSortKey(key);

        const sortedCompanies = [...companies].sort((a, b) => {
            if (order === "asc") {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });

        setCompanies(sortedCompanies);
    };

    return (
        <div className={styles.main}>
            <h2>Lista de Compañías</h2>
            <div className={styles.link}>
            <Link to="/sync/crearcompania/*" className="btn btn-primary">Volver a Crear Compañia</Link>
            <Link to="/sync/home" className="btn btn-primary">Ir a Home</Link>
            </div>
            <br />
            <table className={styles.table}>
                <thead>
                    <tr className={styles.tableHeaderRow}>
                        <th
                            className={styles.tableHeader}
                            onClick={() => handleSort("id")}
                            style={{ cursor: "pointer" }}
                        >
                            ID {sortKey === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                            className={styles.tableHeader}
                            onClick={() => handleSort("name")}
                            style={{ cursor: "pointer" }}
                        >
                            Nombre {sortKey === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className={styles.tableHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr key={company.id} className={styles.tableRow}>
                            <td className={styles.tableCell}>{company.id}</td>
                            <td className={styles.tableCell}>{company.name}</td>
                            <td className={styles.tableCell}>
                                <button
                                    className={styles.editButton}
                                    onClick={() => handleEditClick(company)}
                                >
                                    Editar
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(company)}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Formulario de edición */}
            {editingCompany && (
                <div id="edit-form" className={styles.editForm}>
                    <h3>Editar Compañía</h3>
                    <input
                        type="text"
                        value={newCompanyName}
                        onChange={handleInputChange}
                        placeholder="Nuevo nombre de la compañía"
                    />
                    <button onClick={handleSaveChanges}>Guardar cambios</button>
                    <button onClick={() => setEditingCompany(null)}>Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default EditarCompania;
