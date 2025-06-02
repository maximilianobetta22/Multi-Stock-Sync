import  { useState, useEffect } from "react";
import { message, Spin, Typography, List } from "antd";
import {
  FaCommentDots,
  FaTimes,
  FaBoxOpen,
  FaFileAlt,
  FaPlus,
  FaKey,
  FaQuestionCircle,
  FaExchangeAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import styles from "./ChatBotAyuda.module.css";

const { Text } = Typography;
const MySwal = withReactContent(Swal);

const ChatBotAyuda = () => {
  const [open, setOpen] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);
  const [mostrarCambioConexion, setMostrarCambioConexion] = useState(false);
  const [conexiones, setConexiones] = useState<any[]>([]);
  const [cargandoConexiones, setCargandoConexiones] = useState(false);
  const [conexionActual, setConexionActual] = useState<any | null>(null);
  const navigate = useNavigate();

  const preguntas = [
    { label: "Ver productos sin stock", ruta: "/sync/productos?stock=0", icono: <FaBoxOpen /> },
    { label: "Crear un nuevo producto", ruta: "/sync/productos/crear", icono: <FaPlus /> },
    { label: "Ir al módulo de reportes", ruta: "/sync/reportes/home", icono: <FaFileAlt /> },
    { label: "Cambiar mi contraseña", ruta: "/sync/usuario/configuracion", icono: <FaKey /> },
    { label: "Cambiar de conexión", ruta: "", icono: <FaExchangeAlt />, esCambioConexion: true },
    { label: "Necesito ayuda general", ruta: "/sync/contacto", icono: <FaQuestionCircle /> },
  ];

  useEffect(() => {
    const seleccionada = localStorage.getItem("conexionSeleccionada");
    if (seleccionada) {
      try {
        const parsed = JSON.parse(seleccionada);
        setConexionActual(parsed);
      } catch {
        localStorage.removeItem("conexionSeleccionada");
        setConexionActual(null);
      }
    }
  }, []);

  const manejarClick = async (
    label: string,
    ruta: string,
    esCambioConexion?: boolean
  ) => {
    if (esCambioConexion) {
      setCargandoConexiones(true);
      setMostrarCambioConexion(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/conexionToken`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const conexionesCrudas = response.data;
        const conexionesActualizadas = await Promise.all(
          conexionesCrudas.map(async (conexion: any) => {
            try {
              const refresh = await axios.get(
                `${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${conexion.client_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );
              return {
                ...conexion,
                tokenVigente: refresh.data.status === "success",
              };
            } catch {
              return { ...conexion, tokenVigente: false };
            }
          })
        );

        setConexiones(conexionesActualizadas);
      } catch {
        message.error("Error al cargar conexiones");
      } finally {
        setCargandoConexiones(false);
      }
      return;
    }

    MySwal.fire({
      title: "¿Deseas continuar?",
      text: `Te redirigiremos a: ${label}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, ir ahora",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setHistorial((prev) => [...prev.slice(-4), label]);
        navigate(ruta);
        setOpen(false);
      }
    });
  };

  const seleccionarConexion = (conexion: any) => {
    if (conexion.tokenVigente) {
      localStorage.setItem("conexionSeleccionada", JSON.stringify(conexion));
      message.success(`✅ Conexión cambiada exitosamente a: ${conexion.nickname}`);
      setConexionActual(conexion);
      setMostrarCambioConexion(false);
      setOpen(false);
      window.location.reload();
    } else {
      message.warning("⚠️ No puedes seleccionar una conexión con el token vencido.");
    }
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

          {conexionActual && (
            <div className={styles.respuesta}>
              <Text strong>Conectado como:</Text> {conexionActual.nickname}
            </div>
          )}

          <div className={styles.preguntas}>
            {preguntas.map((item, i) => (
              <button
                key={i}
                onClick={() =>
                  manejarClick(item.label, item.ruta, item.esCambioConexion)
                }
              >
                <span className={styles.icono}>{item.icono}</span>
                {item.label}
              </button>
            ))}
          </div>

          {mostrarCambioConexion && (
            <>
              <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
                🔄 Selecciona otra conexión:
              </p>
              {cargandoConexiones ? (
                <Spin />
              ) : (
                <List
                  size="small"
                  dataSource={conexiones}
                  renderItem={(conexion) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <button
                        className={styles.preguntasButton}
                        disabled={!conexion.tokenVigente}
                        style={{
                          backgroundColor: conexion.tokenVigente ? "#e9f3ff" : "#f5f5f5",
                          color: conexion.tokenVigente ? "#213f99" : "#999",
                          cursor: conexion.tokenVigente ? "pointer" : "not-allowed",
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                        onClick={() => seleccionarConexion(conexion)}
                      >
                        {conexion.nickname}
                        {!conexion.tokenVigente && " (Token vencido)"}
                      </button>
                    </List.Item>
                  )}
                />
              )}
            </>
          )}

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
