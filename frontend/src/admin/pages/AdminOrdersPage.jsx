import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, RefreshCw, Eye } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminOrdersPage.css';

const STATUS_FILTERS = [
  { key: '', label: 'All Orders' },
  { key: 'PLACED', label: 'Placed (New)' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' }
];

const AdminOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentStatus, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminOrders({
        status: currentStatus,
        page,
        limit: 20
      });
      if (res.success) {
        setOrders(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (statusKey) => {
    if (statusKey) {
      setSearchParams({ status: statusKey });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Orders Management Queue</h1>
          <p className="admin-page-sub">Review incoming meal orders, update preparation milestones, and manage dispatch.</p>
        </div>
        <button onClick={fetchOrders} className="admin-refresh-btn">
          <RefreshCw size={15} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleStatusFilterChange(f.key)}
            className={`filter-tab ${currentStatus === f.key ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loading text="Loading orders..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <div className="admin-empty-state">
          <ShoppingCart size={48} className="empty-icon" />
          <h3>No Orders Found</h3>
          <p>There are no orders matching the status '{currentStatus || 'All'}'.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Recipient / Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total (NPR)</th>
                <th>Status</th>
                <th>Placed At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id}>
                  <td className="bold-cell">{ord.orderNumber}</td>
                  <td>
                    <div className="customer-cell">
                      <strong>{ord.delivery?.recipientName || ord.user?.name || 'Customer'}</strong>
                      <span className="customer-email">{ord.user?.email}</span>
                    </div>
                  </td>
                  <td>{ord.delivery?.phone}</td>
                  <td>{ord.items.length} item{ord.items.length > 1 ? 's' : ''}</td>
                  <td className="tabular-nums bold-cell">NPR {ord.total}</td>
                  <td>
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="time-cell">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <br />
                    <span className="date-sub">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${ord._id}`} className="admin-action-btn">
                      <Eye size={15} />
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
