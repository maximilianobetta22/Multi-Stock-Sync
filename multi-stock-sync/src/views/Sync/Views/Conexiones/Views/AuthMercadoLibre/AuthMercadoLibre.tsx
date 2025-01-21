import { useState } from "react";
import styles from "./AuthMercadoLibre.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { faLock, faLockOpen, faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap components
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";

const AuthMercadoLibre = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus("");

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mercadolibre/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status || "success");
        setMessage(data.message || "URL generada correctamente. Redirigiendo...");

        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank");
        }
      } else {
        setStatus("error");
        setMessage(
          data.message || "Error: No se pudieron validar las credenciales."
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Error: Ocurrió un problema inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.formContainer}>
        <div className={styles.formControl}>
          <div>
            <h3 className={styles.title}>Agregar Conexión</h3>
            <p className={styles.subtitle}>
              Ingrese las credenciales para generar la URL de autenticación.
            </p>
          </div>

          <div className={styles.inputContainer}>
            <FontAwesomeIcon
              icon={faAddressCard}
              className={styles.inputIcon}
            />
            <input
              id="clientId"
              type="text"
              onChange={(e) => setClientId(e.target.value)}
              className={styles.inputField}
              placeholder=" "
              value={clientId}
              required
            />
            <label htmlFor="clientId" className={styles.floatingLabel}>
              ID del Cliente
            </label>
          </div>
          <div className={styles.inputContainer}>
            <FontAwesomeIcon
              icon={showPassword ? faLockOpen : faLock}
              className={styles.lockIcon}
              onClick={togglePasswordVisibility}
            />
            <input
              id="clientSecret"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setClientSecret(e.target.value)}
              className={styles.inputField}
              placeholder=" "
              value={clientSecret}
              required
            />
            <label htmlFor="clientSecret" className={styles.floatingLabel}>
              Client Secret
            </label>
          </div>

            <p onClick={handleShow} className={`${styles.helpLink} mt-3`}>¿Qué es esto? </p>

          {message && (
            <ToastComponent
              message={message}
              type={status === "success" ? "success" : "danger"}
              onClose={() => setMessage("")}
              timeout={5000}
            />
          )}

            <div className={`mt-5 d-flex flex-column flex-md-row`}>  
            <button
              type="submit"
              className={`btn btn-primary mx-3 mb-2 mb-md-0`}
              disabled={loading}
            >
              {loading ? "Generando URL..." : "Conectarse a MercadoLibre"}
            </button>
            <Link to="/sync/conexiones/home" className="btn btn-secondary mx-3 mb-2 mb-md-0" >Volver a conexiones</Link>
          </div>

        </div>
      </form>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Instrucciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para obtener las credenciales de MercadoLibre, sigue estos pasos:</p>
          <ol>
            <li>Visita la <a href="https://developers.mercadolibre.cl/devcenter/" target="_blank">página de desarrolladores de MercadoLibre</a> e inicia sesión.</li>
            <li>Crea una nueva aplicación para obtener el Client ID y Client Secret.</li>
            <img src="/assets/img/form_login/form_image1.png" className={styles.modalImage} alt="Instrucciones 1" />
            <li>Copia el Client ID y Client Secret en el formulario principal y presiona "Conectarse a MercadoLibre".</li>
            <img src="/assets/img/form_login/form_image2.png" className={styles.modalImage} alt="Instrucciones 2" />
          </ol>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingMessage}>Procesando...</p>
        </div>
      )}
    </div>
  );
};

export default AuthMercadoLibre;
