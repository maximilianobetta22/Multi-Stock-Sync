import React, { useState } from "react";
import { FaCommentDots, FaTimes, FaBoxOpen, FaFileAlt, FaPlus, FaKey, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "./ChatBotAyuda.module.css";

const MySwal = withReactContent(Swal);

const ChatBotAyuda = () => {
  const [open, setOpen] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);
  const navigate = useNavigate();

  const preguntas = [
    { label: "Ver productos sin stock", ruta: "/sync/productos?stock=0", icono: <FaBoxOpen /> },
    { label: "Crear un nuevo producto", ruta: "/sync/productos/crear", icono: <FaPlus /> },
    { label: "Ir al módulo de reportes", ruta: "/sync/reportes/home", icono: <FaFileAlt /> },
    { label: "Cambiar mi contraseña", ruta: "/sync/usuario/configuracion", icono: <FaKey /> },
    { label: "Necesito ayuda general", ruta: "/sync/contacto", icono: <FaQuestionCircle /> },
  ];

  const manejarClick = (label: string, ruta: string) => {
    MySwal.fire({
      title: "¿Deseas continuar?",
      text: `Te redirigiremos a: ${label}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, ir ahora",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setHistorial((prev) => [...prev.slice(-4), label]); // máx. 4 preguntas anteriores
        navigate(ruta);
        setOpen(false);
      }
    });
  };

  return (
    <div className={styles.chatbotContainer}>
      <button className={styles.toggleButton} onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaCommentDots />}
      </button>

      {open && (
        <div className={styles.chatbox}>
          <h5>🤖 Asistente de ayuda</h5>
          <p>¿Qué necesitas hacer?</p>

          <div className={styles.preguntas}>
            {preguntas.map((item, i) => (
              <button key={i} onClick={() => manejarClick(item.label, item.ruta)}>
                <span className={styles.icono}>{item.icono}</span>
                {item.label}
              </button>
            ))}
          </div>

          {historial.length > 0 && (
            <div className={styles.historial}>
              <p className={styles.historialTitulo}>Últimas consultas:</p>
              <ul>
                {historial.map((item, i) => (
                  <li key={i}>🔹 {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBotAyuda;

