import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminAuth.css';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@foodorder.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied: You are logged in as a customer, but admin privileges are required.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="shield-avatar">
            <Shield size={32} color="var(--color-accent)" />
          </div>
          <h1>Staff Operations Portal</h1>
          <p>Sign in with administrative privileges to manage menus and order flows.</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-email">
              <Mail size={15} /> Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">
              <Lock size={15} /> Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? 'Authenticating...' : 'Sign In to Console'}
            <LogIn size={18} />
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-store-link">
            <ArrowLeft size={15} />
            <span>Return to Customer Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
