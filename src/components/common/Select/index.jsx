import React from 'react';
import '../Input/Input.css';

const Select = ({ label, options = [], error, required, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label} {required && <span className="text-danger">*</span>}</label>}
      <select 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Select;