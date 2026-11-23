import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(217, 74, 66, 0.12)',
        border: '1px solid rgba(217, 74, 66, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        color: 'var(--color-text)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={20} color="var(--color-danger)" />
        <span style={{ fontSize: '0.95rem' }}>{message || 'Something went wrong.'}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
