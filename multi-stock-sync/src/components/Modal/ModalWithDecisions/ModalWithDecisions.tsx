import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const handlePrimaryAction = () => {
    setIsLoading(true);
    primaryAction();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>{title}</h2>
        {isLoading ? (
          <div className={`spinner-border ${styles.modalLoadingSpinner}`} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <div className={styles.modalButtons}>
            <button
              className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
              onClick={handlePrimaryAction}
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
        )}
      </div>
    </div>
  );
};

export default ModalWithDecisions;
