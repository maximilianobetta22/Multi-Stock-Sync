import styles from "./LoginMercado.module.css";
import { useState } from "react";

const login = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  return (
    <div className={styles.loginContainer}>
      <form className={styles.formContainer}>
        <div className={styles.formControl}>
          <div>
            <h3 className={styles.title}>LoginSync</h3>
            <p className={styles.subtitle}>
              Ingrese credenciales de MercadoLibre
            </p>
          </div>
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
          <div className="alert alert-danger" role="alert">
            A simple danger alert with an example link . Give it a click if you
            like.
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonSave}`}
            >
              Guardar Credenciales
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default login;
