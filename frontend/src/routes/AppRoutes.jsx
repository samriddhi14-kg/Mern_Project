import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common Guards
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';

// Customer Pages
import HomePage from '../customer/pages/HomePage';
import FoodDetailPage from '../customer/pages/FoodDetailPage';
import CartPage from '../customer/pages/CartPage';
import CheckoutPage from '../customer/pages/CheckoutPage';
import MyOrdersPage from '../customer/pages/MyOrdersPage';
import OrderDetailsPage from '../customer/pages/OrderDetailsPage';
import LoginPage from '../customer/pages/LoginPage';
import RegisterPage from '../customer/pages/RegisterPage';

// Admin Layout & Pages
import AdminLayout from '../components/layout/AdminLayout';
import AdminLoginPage from '../admin/pages/AdminLoginPage';
import AdminDashboardPage from '../admin/pages/AdminDashboardPage';
import AdminOrdersPage from '../admin/pages/AdminOrdersPage';
import AdminOrderDetailPage from '../admin/pages/AdminOrderDetailPage';
import AdminFoodsPage from '../admin/pages/AdminFoodsPage';
import AdminCategoriesPage from '../admin/pages/AdminCategoriesPage';
import AdminUsersPage from '../admin/pages/AdminUsersPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/food/:id" element={<FoodDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Portal Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="foods" element={<AdminFoodsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
