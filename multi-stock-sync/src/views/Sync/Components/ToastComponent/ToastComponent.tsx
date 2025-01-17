import React from 'react';

interface ToastComponentProps {
    message: string;
    type: 'success' | 'secondary' | 'warning' | 'danger';
    onClose: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ message, type, onClose, onConfirm, onCancel }) => {
    return (
        <div className={`toast show position-fixed bottom-0 end-0 m-3 bg-${type}`} role="alert" aria-live="assertive" aria-atomic="true" style={{ zIndex: 1050 }}>
            <div className={`toast-header bg-${type}`}>
            <strong className="me-auto" style={{ color: 'white' }}>MultiStock-Sync</strong>
            <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="toast-body" style={{ backgroundColor: 'white', color: 'black' }}>
            {message}
            {onConfirm && onCancel && (
                <div className="mt-2">
                    <button type="button" className="btn btn-secondary me-2" onClick={onConfirm}>Sí</button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>No</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default ToastComponent;
