import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './OrderDetailsPage.css';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'In Kitchen' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'On The Way' },
  { key: 'DELIVERED', label: 'Delivered' }
];

const OrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const fetchOrder = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setError(null);
      const res = await api.getOrderById(id);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(true);
  }, [id]);

  // Polling every 15s for live updates until order reaches terminal state
  useEffect(() => {
    if (!order) return;
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return;

    const interval = setInterval(() => {
      fetchOrder(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [order?.status, id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.cancelOrder(order._id, cancelReason || 'Customer requested cancellation');
      if (res.success) {
        setOrder(res.data);
        setShowCancelPrompt(false);
      }
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading fullPage text="Retrieving live order tracking..." />;
  if (error) return <div className="container"><ErrorMessage message={error} onRetry={() => fetchOrder(true)} /></div>;
  if (!order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container order-detail-container">
      <div className="detail-top-nav">
        <Link to="/orders" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to All Orders</span>
        </Link>
        <button onClick={() => fetchOrder(false)} className="refresh-status-btn" title="Refresh Status">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="order-tracking-card">
        <div className="tracking-header">
          <div>
            <div className="tracking-order-num">{order.orderNumber}</div>
            <div className="tracking-date">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Live Stepper / Progress Bar */}
        {isCancelled ? (
          <div className="cancelled-banner">
            <XCircle size={24} />
            <div>
              <strong>Order Cancelled</strong>
              <p>Reason: {order.cancellationReason || 'No reason provided.'}</p>
            </div>
          </div>
        ) : (
          <div className="progress-stepper">
            {STEPS.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`stepper-node ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="stepper-circle">
                    {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="stepper-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Action if Order is PLACED */}
        {order.status === 'PLACED' && (
          <div className="placed-cancel-section">
            {!showCancelPrompt ? (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="trigger-cancel-btn"
              >
                Need to cancel this order?
              </button>
            ) : (
              <div className="cancel-prompt-box">
                <h4>Cancel Order Confirmation</h4>
                <p>Are you sure you want to cancel this order? You can only cancel while status is still 'PLACED'.</p>
                <input
                  type="text"
                  placeholder="Optional cancellation reason (e.g. Changed my mind)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <div className="prompt-actions">
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="confirm-cancel-btn"
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                  <button
                    onClick={() => setShowCancelPrompt(false)}
                    className="abort-cancel-btn"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="order-info-grid">
        {/* Ordered Meals Breakdown */}
        <div className="info-card">
          <h2>Items Ordered</h2>
          <div className="items-table">
            {order.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-calc tabular-nums">
                    {item.quantity} × NPR {item.unitPrice}
                  </span>
                </div>
                <span className="item-linetotal tabular-nums">NPR {item.lineTotal}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-line">
            <span>Subtotal</span>
            <span className="tabular-nums">NPR {order.subtotal}</span>
          </div>
          <div className="summary-line">
            <span>Delivery Fee</span>
            <span className="tabular-nums">NPR {order.deliveryFee}</span>
          </div>
          <div className="summary-line grand-total">
            <span>Total Payable (COD)</span>
            <span className="tabular-nums">NPR {order.total}</span>
          </div>
        </div>

        {/* Delivery Details & Status History */}
        <div className="info-card">
          <h2>Delivery & Contact Information</h2>
          <div className="delivery-details-list">
            <div className="detail-item">
              <span className="detail-label">Recipient:</span>
              <span className="detail-val">{order.delivery.recipientName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-val">{order.delivery.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-val">{order.delivery.address}</span>
            </div>
            {order.delivery.instructions && (
              <div className="detail-item">
                <span className="detail-label">Notes:</span>
                <span className="detail-val">{order.delivery.instructions}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Payment:</span>
              <span className="detail-val">Cash on Delivery ({order.paymentStatus})</span>
            </div>
          </div>

          <h3 className="history-subtitle">Status History Timeline</h3>
          <div className="status-history-timeline">
            {order.statusHistory.map((h, i) => (
              <div key={i} className="timeline-event">
                <div className="event-bullet"></div>
                <div className="event-content">
                  <div className="event-header">
                    <strong>{h.status}</strong>
                    <span className="event-time">
                      {new Date(h.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {h.note && <p className="event-note">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
