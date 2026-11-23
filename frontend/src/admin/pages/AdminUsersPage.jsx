import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminUsers({ limit: 50 });
      if (res.success) {
        setUsers(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch registered customers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Registered Customers ({total})</h1>
          <p className="admin-page-sub">Customer accounts registered for online food ordering.</p>
        </div>
      </div>

      {loading ? (
        <Loading text="Loading customer profiles..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <div className="admin-empty-state">
          <Users size={48} className="empty-icon" />
          <h3>No Customers Yet</h3>
          <p>Customer accounts will appear here once users register on the website.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Joined Date</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="bold-cell">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td className="time-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`user-active-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
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

export default AdminUsersPage;
