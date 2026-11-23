import React from 'react';

const Loading = ({ fullPage = false, text = 'Loading...' }) => {
  const containerStyle = fullPage
    ? {
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }
    : {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--color-surface-raised)',
          borderTop: '3px solid var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
};

export default Loading;
