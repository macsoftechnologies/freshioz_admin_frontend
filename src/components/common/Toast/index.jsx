import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const Toast = ({ id, message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="toast-icon toast-success-icon" size={20} />,
    error: <AlertCircle className="toast-icon toast-error-icon" size={20} />,
    info: <Info className="toast-icon toast-info-icon" size={20} />,
    warning: <AlertTriangle className="toast-icon toast-warning-icon" size={20} />
  };

  return (
    <div className={`toast show custom-toast custom-toast-${type} toast-${type}`}>
      {icons[type]}
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;