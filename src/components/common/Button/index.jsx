import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner"></span>}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;