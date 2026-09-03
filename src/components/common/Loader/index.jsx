import React from 'react';
import './Loader.css';
import logoImg from '../../../assets/logo/freshioz_logo.png';

function Loader({
  text = "Loading...",
  size = "md",
  showLogo = true,
  className = "",
}) {
  const safeSize = ["sm", "md", "lg"].includes(size) ? size : "md";

  return (
    <div
      className={`ssw-loader ssw-loader--${safeSize} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading"}
    >
      {showLogo && (
        <img
          src={logoImg}
          alt="Freshioz"
          className="ssw-loader__logo"
        />
      )}

      <div className="ssw-loader__progress" aria-hidden="true">
        <span className="ssw-loader__progress-bar" />
      </div>

      {text && (
        <div className="ssw-loader__text">
          {text}
        </div>
      )}
    </div>
  );
}

export default Loader;
