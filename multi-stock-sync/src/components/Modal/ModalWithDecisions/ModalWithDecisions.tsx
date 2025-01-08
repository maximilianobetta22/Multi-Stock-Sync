import React from 'react';
import styles from './ModalWithDecisions.module.css';

interface ModalWithDecisionsProps {
  title: string;
  primaryAction: () => void;
  secondaryAction: () => void;
  primaryLabel: string;
  secondaryLabel: string;
}

const ModalWithDecisions: React.FC<ModalWithDecisionsProps> = ({
  title,
  primaryAction,
  secondaryAction,
  primaryLabel,
  secondaryLabel,
}) => {
  return (
    <div className={styles.modalContainer}>
      <h2 className={styles.modalTitle}>{title}</h2>
      <div className={styles.modalButtons}>
        <button
          className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
          onClick={primaryAction}
        >
          {primaryLabel}
        </button>
        <button
          className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
          onClick={secondaryAction}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
};

export default ModalWithDecisions;
