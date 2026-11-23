import React from 'react';

const STATUS_CONFIG = {
  PLACED: { label: 'Placed', bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
  CONFIRMED: { label: 'Confirmed', bg: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  PREPARING: { label: 'Preparing', bg: 'rgba(217, 154, 53, 0.15)', color: 'var(--color-warning)', border: 'rgba(217, 154, 53, 0.3)' },
  PACKED: { label: 'Packed', bg: 'rgba(234, 179, 8, 0.15)', color: '#FACC15', border: 'rgba(234, 179, 8, 0.3)' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'rgba(240, 90, 40, 0.15)', color: 'var(--color-accent)', border: 'rgba(240, 90, 40, 0.3)' },
  DELIVERED: { label: 'Delivered', bg: 'rgba(62, 155, 104, 0.15)', color: 'var(--color-success)', border: 'rgba(62, 155, 104, 0.3)' },
  CANCELLED: { label: 'Cancelled', bg: 'rgba(217, 74, 66, 0.15)', color: 'var(--color-danger)', border: 'rgba(217, 74, 66, 0.3)' }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'rgba(182, 170, 160, 0.15)',
    color: 'var(--color-text-muted)',
    border: 'var(--color-border)'
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
