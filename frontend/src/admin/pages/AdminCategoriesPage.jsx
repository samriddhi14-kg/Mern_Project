import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { api } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminCategoriesPage.css';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete or deactivate category '${cat.name}'?`)) {
      return;
    }

    try {
      const res = await api.deleteAdminCategory(cat._id);
      if (res.success) {
        alert(res.message);
        fetchCategories();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const res = await api.updateAdminCategory(editingCat._id, formData);
        if (res.success) {
          setShowModal(false);
          fetchCategories();
        }
      } else {
        const res = await api.createAdminCategory(formData);
        if (res.success) {
          setShowModal(false);
          fetchCategories();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Categories Management</h1>
          <p className="admin-page-sub">Organize food items into discoverable menu sections.</p>
        </div>
        <button onClick={handleOpenAdd} className="admin-primary-btn">
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {loading ? (
        <Loading text="Loading categories..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCategories} />
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="bold-cell">{cat.name}</td>
                  <td><code>{cat.slug}</code></td>
                  <td>{cat.description || '—'}</td>
                  <td>
                    <span className={`cat-status-pill ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button onClick={() => handleOpenEdit(cat)} className="icon-action-btn edit" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="icon-action-btn delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-head">
              <h3>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Burgers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Slug (Optional, auto-generated from name)</label>
                <input
                  type="text"
                  placeholder="e.g. burgers"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  placeholder="Short summary of this food group..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active in Store Navigation</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" className="modal-confirm-btn">
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="modal-cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
