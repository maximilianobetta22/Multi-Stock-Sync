import styles from "./LoadingDinamico.module.css";

interface LoadingDinamicoProps {
  variant?: "container" | "transparent" | "fullScreen";
  text?: string; // opcional: texto como "Cargando Productos..."
  logo?: string; // opcional: path a logo si quieres usar imagen
}

export const LoadingDinamico = ({ variant = "fullScreen", text, logo }: LoadingDinamicoProps) => {
  const classMap = {
    container: styles.container__Loading,
    transparent: styles.transparent__Loading,
    fullScreen: styles.fullScreen__Loading,
  };

  return (
    <div className={classMap[variant]}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        {logo && <img src={logo} alt="Logo" className={styles.logo} />}
        {text && <p className={styles.loadingText}>{text}</p>}
      </div>
    </div>
  );
};
