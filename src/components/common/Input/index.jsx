import React from 'react';
import './Input.css';

const Input = ({ label, error, required, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label} {required && <span className="text-danger">*</span>}</label>}
      <input 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;