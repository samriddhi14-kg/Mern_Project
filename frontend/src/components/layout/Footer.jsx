import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span>🍔 Food<span className="accent-text">Hub</span></span>
          </div>
          <p className="footer-tagline">
            Fresh, delicious restaurant favorites prepared on-demand and delivered straight to your door with Cash on Delivery.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Menu & Browse</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Order Tracking</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Admin</h4>
          <ul>
            <li><Link to="/admin">Admin Dashboard</Link></li>
            <li><Link to="/admin/orders">Order Management</Link></li>
            <li><Link to="/admin/foods">Menu Catalog</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Service Details</h4>
          <p className="service-note">Payment Method: <strong>Cash on Delivery (COD)</strong></p>
          <p className="service-note">Delivery Time: <strong>25 - 45 mins</strong></p>
          <p className="service-note">Flat Delivery Fee: <strong>NPR 50</strong></p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>© {new Date().getFullYear()} FoodHub MERN Food Delivery. All rights reserved.</p>
          <p className="footer-sub">Single-store ordering architecture built strictly with React, Node.js, Express & MongoDB.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
