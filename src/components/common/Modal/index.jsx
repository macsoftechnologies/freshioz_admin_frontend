import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

function Modal({
  open,
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  centered = false,
  scrollable = true,
  backdropClosable = false, // Must not close on outside click; close only via close button
  type = 'default',
  footer,
  fullscreen = false,
  className = '',
}) {
  const show = open !== undefined ? open : isOpen;

  /* Lock body scroll while open */
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  /* Size class */
  let sizeClass = '';
  switch (size) {
    case 'sm':  sizeClass = 'beam-modal-sm modal-sm'; break;
    case 'lg':  sizeClass = 'beam-modal-lg modal-lg'; break;
    case 'xl':  sizeClass = 'beam-modal-xl modal-xl'; break;
    default:    sizeClass = 'beam-modal-md modal-md';
  }

  const modalNode = (
    <>
      {/* Backdrop (clicking outside does NOT close modal) */}
      <div
        className="beam-modal-backdrop modal-overlay"
        onClick={() => {
          if (backdropClosable && onClose) {
            onClose();
          }
        }}
      />

      {/* Positioning wrapper */}
      <div
        className={`beam-modal-positioner ${centered ? 'beam-modal-positioner--centered' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && backdropClosable && onClose) {
            onClose();
          }
        }}
      >
        {/* Dialog panel */}
        <div
          className={`beam-modal-dialog modal-content ${sizeClass} ${fullscreen ? 'beam-modal--fullscreen' : ''} ${className}`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="beam-modal-header modal-header">
            <div className="beam-modal-header-left">
              <span className="beam-modal-accent-dot" />
              <h5 className="beam-modal-title modal-title">{title}</h5>
            </div>
            <button
              type="button"
              className="beam-modal-close modal-close"
              onClick={onClose}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className={`beam-modal-body modal-body ${scrollable ? 'beam-modal-body--scrollable' : ''}`}>
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="beam-modal-footer modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalNode, document.body);
}

export default Modal;