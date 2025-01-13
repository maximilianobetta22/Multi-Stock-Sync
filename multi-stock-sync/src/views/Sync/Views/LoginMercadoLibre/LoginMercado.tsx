import styles from "./LoginMercado.module.css";

const login = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <div className={styles.formControl}>
          <div>
            <h3>LoginSync</h3>
            <p>Ingrese credenciales de MercadoLibre</p>
          </div>
          <div className={styles.inputContainer}>
            <input
              id="clientId"
              type="text"
              className={styles.inputField}
              placeholder=" "
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
              className={styles.inputField}
              placeholder=" "
              required
            />
            <label htmlFor="clientSecret" className={styles.floatingLabel}>
              Client Secret
            </label>
          </div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.button} ${styles.buttonSave}`}>
              Guardar Credenciales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;
