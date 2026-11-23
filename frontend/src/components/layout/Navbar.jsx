import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Shield, Compass, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🍔</span>
          <span className="logo-text">Food<span className="accent-text">Hub</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Compass size={18} />
            <span>Menu</span>
          </NavLink>

          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <Clock size={18} />
              <span>My Orders</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-item admin-pill active' : 'nav-item admin-pill')}>
              <Shield size={16} />
              <span>Admin Portal</span>
            </NavLink>
          )}
        </nav>

        {/* User & Cart Actions */}
        <div className="nav-actions">
          {/* Cart Icon button */}
          {!isAdmin && (
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-profile">
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Log In</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
