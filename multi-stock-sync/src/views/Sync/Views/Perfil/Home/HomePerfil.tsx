import React,{useState} from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from "./Perfil.module.css";


const HomePerfil: React.FC = () => {

    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Estado para la fecha seleccionada

    return (
        <div className={styles.main}>
            <div>

            <div>
            {/* Calendario desplegable */}
            <div className="mb-3">
                <label htmlFor="datePicker" className="form-label">
                Filtrar por Fecha:
                </label>
                <DatePicker
                id="datePicker"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)} 
                className="form-control"
                placeholderText="Selecciona una fecha"/>
                <div>
                    <button>Agregar Conexiones</button>
                </div>
            </div>
            <div className={styles.tabla}>
                {/*Tabla*/}
                <table className="table table-dark">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Cliente</th>
                            <th scope="col">Fecha de Inicio</th>
                            <th scope="col">Fecha Actualizada</th>
                        </tr>
                    </thead>
                </table>
            </div>
            </div>
        </div>
    </div>
    );
};

export default HomePerfil;