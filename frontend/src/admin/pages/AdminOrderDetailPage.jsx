import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock, AlertTriangle, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminOrderDetailPage.css';

const NEXT_STATUS_MAP = {
  PLACED: { next: 'CONFIRMED', label: 'Accept & Confirm Order', color: 'var(--color-accent)' },
  CONFIRMED: { next: 'PREPARING', label: 'Send to Kitchen (Preparing)', color: 'var(--color-warning)' },
  PREPARING: { next: 'PACKED', label: 'Mark as Packed & Ready', color: '#FACC15' },
  PACKED: { next: 'OUT_FOR_DELIVERY', label: 'Dispatch (Out for Delivery)', color: 'var(--color-accent)' },
  OUT_FOR_DELIVERY: { next: 'DELIVERED', label: 'Confirm Delivered (Settled COD)', color: 'var(--color-success)' }
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Transition form
  const [statusNote, setStatusNote] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminOrderById(id);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (nextStatus) => {
    try {
      setUpdating(true);
      const res = await api.updateAdminOrderStatus(order._id, {
        status: nextStatus,
        note: statusNote.trim() || `Status updated to ${nextStatus} by staff.`
      });

      if (res.success) {
        setOrder(res.data);
        setStatusNote('');
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancelling this order.');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.updateAdminOrderStatus(order._id, {
        status: 'CANCELLED',
        cancellationReason: cancelReason.trim(),
        note: `Cancelled by admin: ${cancelReason.trim()}`
      });

      if (res.success) {
        setOrder(res.data);
        setShowCancelModal(false);
        setCancelReason('');
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading fullPage text="Retrieving complete order record..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrder} />;
  if (!order) return null;

  const nextTransition = NEXT_STATUS_MAP[order.status];
  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';

  return (
    <div className="admin-order-detail-page">
      <Link to="/admin/orders" className="admin-back-link">
        <ArrowLeft size={16} />
        <span>Return to Orders Queue</span>
      </Link>

      <div className="admin-order-head-card">
        <div className="head-info">
          <div className="head-num-wrap">
            <h1>{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="head-timestamp">
            Order created on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Operational Status Action Bar */}
        <div className="head-actions">
          {!isTerminal && nextTransition && (
            <div className="advance-action-group">
              <input
                type="text"
                placeholder="Staff note (optional, e.g. Kitchen started ticket #12)"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="staff-note-input"
              />
              <button
                onClick={() => handleAdvanceStatus(nextTransition.next)}
                disabled={updating}
                className="advance-btn"
                style={{ backgroundColor: nextTransition.color }}
              >
                <CheckCircle2 size={16} />
                <span>{updating ? 'Updating...' : nextTransition.label}</span>
              </button>
            </div>
          )}

          {!isTerminal && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="admin-cancel-trigger-btn"
            >
              Cancel / Reject Order
            </button>
          )}

          {isTerminal && (
            <div className="terminal-note">
              This order is completed ({order.status}). No further state changes are permitted.
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-head">
              <h3>Cancel Order Confirmation</h3>
              <button onClick={() => setShowCancelModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <p className="modal-desc">
              Cancelling will immediately halt this order. The customer will be notified with the reason you provide below.
            </p>
            <textarea
              rows="3"
              placeholder="State clear reason (e.g., Delivery address unreachable, Customer requested cancellation)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={handleCancelOrder}
                disabled={updating}
                className="modal-confirm-danger-btn"
              >
                {updating ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="modal-cancel-btn"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="admin-order-grid">
        {/* Left Column: Ordered Items Table */}
        <div className="admin-detail-card">
          <h2>Items Ordered ({order.items.length})</h2>
          <div className="admin-items-table">
            {order.items.map((item, idx) => (
              <div key={idx} className="admin-item-row">
                <img
                  src={item.image || '/images/burger.jpg'}
                  alt={item.name}
                  className="admin-item-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/burger.jpg';
                  }}
                />
                <div className="admin-item-desc">
                  <strong>{item.name}</strong>
                  <span className="admin-item-calc tabular-nums">
                    {item.quantity} × NPR {item.unitPrice}
                  </span>
                </div>
                <div className="admin-item-total tabular-nums">
                  NPR {item.lineTotal}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-summary-box">
            <div className="summary-line">
              <span>Items Subtotal:</span>
              <span className="tabular-nums">NPR {order.subtotal}</span>
            </div>
            <div className="summary-line">
              <span>Delivery Fee:</span>
              <span className="tabular-nums">NPR {order.deliveryFee}</span>
            </div>
            <div className="summary-line grand-total">
              <span>Grand Total:</span>
              <span className="tabular-nums">NPR {order.total}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Info + History */}
        <div className="admin-detail-card">
          <h2>Delivery & Contact</h2>
          <div className="admin-meta-list">
            <div className="admin-meta-row">
              <span className="meta-label">Recipient Name:</span>
              <span className="meta-val">{order.delivery.recipientName}</span>
            </div>
            <div className="admin-meta-row">
              <span className="meta-label">Phone Number:</span>
              <span className="meta-val">{order.delivery.phone}</span>
            </div>
            <div className="admin-meta-row">
              <span className="meta-label">Delivery Address:</span>
              <span className="meta-val">{order.delivery.address}</span>
            </div>
            {order.delivery.instructions && (
              <div className="admin-meta-row">
                <span className="meta-label">Instructions:</span>
                <span className="meta-val">{order.delivery.instructions}</span>
              </div>
            )}
            <div className="admin-meta-row">
              <span className="meta-label">Payment:</span>
              <span className="meta-val">
                Cash on Delivery (Status: <strong>{order.paymentStatus}</strong>)
              </span>
            </div>
          </div>

          <h3 className="admin-history-title">Order Status History</h3>
          <div className="admin-history-timeline">
            {order.statusHistory.map((h, i) => (
              <div key={i} className="admin-history-event">
                <div className="history-dot"></div>
                <div className="history-content">
                  <div className="history-head">
                    <span className="history-status">{h.status}</span>
                    <span className="history-time">
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                  {h.note && <p className="history-note">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
