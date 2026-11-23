const ALLOWED_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

/**
 * Validates whether an order status transition is permissible.
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      isValid: false,
      message: `Invalid state transition from '${currentStatus}' to '${newStatus}'. Allowed next states: [${(allowed || []).join(', ') || 'None (terminal)'}]`
    };
  }
  return { isValid: true };
};

/**
 * Applies status update to an order document.
 */
const applyStatusChange = (order, newStatus, note, actorId, cancellationReason = null) => {
  const check = validateStatusTransition(order.status, newStatus);
  if (!check.isValid) {
    const error = new Error(check.message);
    error.statusCode = 409;
    throw error;
  }

  if (newStatus === 'CANCELLED' && !cancellationReason && !note) {
    const error = new Error('A cancellation reason or note is required when cancelling an order.');
    error.statusCode = 400;
    throw error;
  }

  order.status = newStatus;
  if (newStatus === 'CANCELLED') {
    order.cancellationReason = cancellationReason || note;
  }

  order.statusHistory.push({
    status: newStatus,
    note: note || `Order marked as ${newStatus}`,
    changedBy: actorId,
    changedAt: new Date()
  });

  return order;
};

module.exports = {
  ALLOWED_TRANSITIONS,
  validateStatusTransition,
  applyStatusChange
};
