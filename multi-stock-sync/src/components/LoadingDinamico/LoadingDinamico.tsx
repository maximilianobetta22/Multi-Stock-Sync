import styles from "./LoadingDinamico.module.css";

interface LoadingDinamicoProps {
  variant: 'container' | 'transparent' | 'fullScreen';
};

export const LoadingDinamico = ({ variant }: LoadingDinamicoProps) => {

  switch (variant) {
    case 'container':
      return (
        <div className={styles.container__Loading}>
          <p className="spinner-border text-primary"></p>
        </div>
      );
    case 'transparent':
      return (
        <div className={styles.transparent__Loading}>
          <p className="spinner-border text-primary"></p>
        </div>
      );
    default:
      return <p className="spinner-border text-primary"></p>;
  }
};