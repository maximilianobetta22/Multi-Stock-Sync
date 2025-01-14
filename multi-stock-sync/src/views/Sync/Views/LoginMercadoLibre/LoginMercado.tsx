import { useState, useEffect } from "react";
import styles from "./LoginMercado.module.css";

const LoginMercado = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Check initial credentials status
  useEffect(() => {
    const fetchCredentialsStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/status`);
        const data = await response.json();

        if (response.ok) {
          setClientId(data.data.client_id);
          setExpiresAt(data.data.expires_at);
          setIsAuthenticated(true);
          setMessage(data.message);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error fetching credentials status:", err);
        setMessage("No se pudo obtener el estado de las credenciales.");
      } finally {
        setLoading(false);
      }
    };

    fetchCredentialsStatus();
  }, []);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status || "success");
        setMessage(data.message || "Credenciales validadas correctamente.");
        setIsAuthenticated(true);

        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank");
        }
      } else {
        setStatus("error");
        setMessage(data.message || "Error: No se pudieron validar las credenciales.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Error: Ocurrió un problema inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/test-connection`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status || "success");
        setMessage(data.message || "Conexión exitosa.");
      } else {
        setStatus("error");
        setMessage(data.message || "Error al probar la conexión.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Error: No se pudo probar la conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/logout`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status || "success");
        setMessage(data.message || "Cierre de sesión exitoso.");
        setIsAuthenticated(false);
        setClientId("");
        setClientSecret("");
      } else {
        setStatus("error");
        setMessage(data.message || "Error al cerrar la sesión.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Error: No se pudo cerrar la sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.formContainer}>
        <div className={styles.formControl}>
          <div>
            <h3 className={styles.title}>LoginSync</h3>
            <p className={styles.subtitle}>
              {isAuthenticated
                ? `Credenciales válidas. Expiran el: ${expiresAt}`
                : "Ingrese credenciales de MercadoLibre"}
            </p>
          </div>

          {!isAuthenticated && (
            <>
              <div className={styles.inputContainer}>
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
                <input
                  id="clientSecret"
                  type="password"
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
            </>
          )}

          {message && (
            <div
              className={`alert ${
                status === "success" ? "alert-success" : "alert-danger"
              }`}
              role="alert"
            >
              {message}
            </div>
          )}

          <div className={styles.buttonGroup}>
            {!isAuthenticated ? (
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonSave}`}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Credenciales"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className={`${styles.button} ${styles.buttonTest}`}
                  disabled={loading}
                >
                  {loading ? "Probando..." : "Probar Conexión"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${styles.button} ${styles.buttonLogout}`}
                  disabled={loading}
                >
                  {loading ? "Cerrando..." : "Cerrar Sesión"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingMessage}>Procesando...</p>
        </div>
      )}
    </div>
  );
};

export default LoginMercado;
