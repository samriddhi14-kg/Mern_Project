import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, UtensilsCrossed, Tag, Users, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/admin" className="brand-logo">
            <span>🍔 FoodHub</span>
            <span className="admin-badge">ADMIN</span>
          </Link>
        </div>

        <nav className="admin-nav">
          <div className="nav-group-label">OVERVIEW</div>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-group-label">OPERATIONS</div>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}>
            <ShoppingCart size={18} />
            <span>Orders Queue</span>
          </NavLink>
          <NavLink to="/admin/foods" className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}>
            <UtensilsCrossed size={18} />
            <span>Food Items</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}>
            <Tag size={18} />
            <span>Categories</span>
          </NavLink>

          <div className="nav-group-label">USERS</div>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}>
            <Users size={18} />
            <span>Customers</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="client-view-link">
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </Link>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-title">FoodHub Operations Console</div>
          <div className="admin-profile-pill">
            <span className="status-dot"></span>
            <span>{user?.name || 'Admin'}</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
