import React from 'react';

const Alert = ({ type = 'info', message, children, onClose }) => {
  if (!message && !children) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ flex: 1 }}>{message || children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            color: 'inherit',
            opacity: 0.7,
            marginLeft: '0.5rem',
          }}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
