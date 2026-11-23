import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullPage text="Retrieving your orders..." />;
  if (error) return <div className="container"><ErrorMessage message={error} onRetry={fetchOrders} /></div>;

  return (
    <div className="container orders-page-container">
      <div className="orders-page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Track real-time meal preparation and past order records</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-card">
          <Package size={52} className="empty-icon" />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any food orders yet. Browse our freshly prepared menu to get started!</p>
          <Link to="/" className="start-ordering-btn">
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

            return (
              <div key={order._id} className="customer-order-card">
                <div className="order-card-top">
                  <div className="order-id-group">
                    <span className="order-number-text">{order.orderNumber}</span>
                    <span className="order-date-text">
                      <Clock size={14} />
                      {formattedDate}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order-items-snippet">
                  <strong>Items:</strong> {itemsSummary}
                </div>

                <div className="order-card-bottom">
                  <div className="order-total-group">
                    <span className="total-label">Total (COD):</span>
                    <span className="total-value tabular-nums">NPR {order.total}</span>
                  </div>

                  <Link to={`/orders/${order._id}`} className="track-order-link">
                    <span>Track Order</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
