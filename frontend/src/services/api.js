const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred');
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Public Menu
  getFoods: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/foods${qs}`);
  },
  getFoodById: (id) => request(`/foods/${id}`),
  getCategories: () => request('/categories'),

  // Customer Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => request('/orders/my'),
  getOrderById: (id) => request(`/orders/${id}`),
  cancelOrder: (id, reason) => request(`/orders/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),

  // Admin Endpoints
  getDashboardMetrics: () => request('/admin/dashboard'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    return request(`/admin/users?${query.toString()}`);
  },
  getAdminUserById: (id) => request(`/admin/users/${id}`),

  getAdminFoods: () => request('/admin/foods'),
  createAdminFood: (data) => request('/admin/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminFood: (id, data) => request(`/admin/foods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminFood: (id) => request(`/admin/foods/${id}`, { method: 'DELETE' }),

  getAdminCategories: () => request('/admin/categories'),
  createAdminCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCategory: (id, data) => request(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    return request(`/admin/orders?${query.toString()}`);
  },
  getAdminOrderById: (id) => request(`/admin/orders/${id}`),
  updateAdminOrderStatus: (id, data) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) })
};
