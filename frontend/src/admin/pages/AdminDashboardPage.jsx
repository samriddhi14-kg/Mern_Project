import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Users, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsRes, ordersRes] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAdminOrders({ limit: 5 })
      ]);

      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }
      if (ordersRes.success) {
        setRecentOrders(ordersRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullPage text="Gathering store performance metrics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  if (!metrics) return null;

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dash-title">Operations Overview</h1>
          <p className="dash-sub">Live monitoring of incoming orders, kitchen queue, and menu items</p>
        </div>
        <Link to="/admin/orders" className="dash-cta-btn">
          View Orders Queue &rarr;
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card highlight-metric">
          <div className="metric-icon-wrap new-orders-icon">
            <ShoppingCart size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">New Incoming Orders</span>
            <span className="metric-val tabular-nums">{metrics.newOrders}</span>
            <span className="metric-foot">Awaiting store confirmation</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap in-progress-icon">
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">In Kitchen / Transit</span>
            <span className="metric-val tabular-nums">{metrics.ordersInProgress}</span>
            <span className="metric-foot">Preparing, packed or en-route</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap delivered-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Delivered Orders</span>
            <span className="metric-val tabular-nums">{metrics.deliveredOrders}</span>
            <span className="metric-foot">Completed orders (COD settled)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap revenue-icon">
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-val tabular-nums">NPR {metrics.totalRevenue}</span>
            <span className="metric-foot">Delivered Cash-on-Delivery</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap foods-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Foods</span>
            <span className="metric-val tabular-nums">{metrics.activeFoods}</span>
            <span className="metric-foot">Available in public menu</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap users-icon">
            <Users size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Registered Customers</span>
            <span className="metric-val tabular-nums">{metrics.totalUsers}</span>
            <span className="metric-foot">Customer accounts</span>
          </div>
        </div>
      </div>

      {/* Quick Orders Queue Snippet */}
      <div className="dashboard-section-card">
        <div className="section-card-head">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="section-head-link">
            See all orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="no-data-msg">No orders placed yet.</p>
        ) : (
          <div className="recent-orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="bold-cell">{ord.orderNumber}</td>
                    <td>{ord.delivery?.recipientName || ord.user?.name || 'Customer'}</td>
                    <td>{ord.delivery?.phone}</td>
                    <td className="tabular-nums">NPR {ord.total}</td>
                    <td>
                      <span className={`status-pill pill-${ord.status.toLowerCase()}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="time-cell">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="table-action-link">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
