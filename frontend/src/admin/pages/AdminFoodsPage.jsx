import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, UtensilsCrossed } from 'lucide-react';
import { api } from '../../services/api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AdminFoodsPage.css';

const AdminFoodsPage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '/images/burger.jpg',
    isAvailable: true,
    preparationTimeMinutes: 20
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [foodsRes, catRes] = await Promise.all([
        api.getAdminFoods(),
        api.getAdminCategories()
      ]);

      if (foodsRes.success) setFoods(foodsRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load food menu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      image: '/images/burger.jpg',
      isAvailable: true,
      preparationTimeMinutes: 20
    });
    setShowModal(true);
  };

  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      category: food.category?._id || food.category,
      price: food.price,
      image: food.image || '/images/burger.jpg',
      isAvailable: food.isAvailable,
      preparationTimeMinutes: food.preparationTimeMinutes || 20
    });
    setShowModal(true);
  };

  const handleToggleAvailability = async (food) => {
    try {
      const res = await api.updateAdminFood(food._id, {
        isAvailable: !food.isAvailable
      });
      if (res.success) {
        setFoods((prev) =>
          prev.map((f) => (f._id === food._id ? res.data : f))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update availability.');
    }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate '${food.name}'?`)) {
      return;
    }

    try {
      const res = await api.deleteAdminFood(food._id);
      if (res.success) {
        alert(res.message);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete food.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      if (editingFood) {
        const res = await api.updateAdminFood(editingFood._id, formData);
        if (res.success) {
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.createAdminFood(formData);
        if (res.success) {
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save food item.');
    }
  };

  return (
    <div className="admin-foods-page">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Menu & Food Items</h1>
          <p className="admin-page-sub">Manage meal offerings, pricing in NPR, and online availability.</p>
        </div>
        <button onClick={handleOpenAdd} className="admin-primary-btn">
          <Plus size={16} />
          <span>Add New Food</span>
        </button>
      </div>

      {loading ? (
        <Loading text="Loading food catalog..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Category</th>
                <th>Price (NPR)</th>
                <th>Prep Time</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food._id}>
                  <td>
                    <div className="food-table-cell">
                      <img
                        src={food.image || '/images/burger.jpg'}
                        alt={food.name}
                        className="food-table-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/burger.jpg';
                        }}
                      />
                      <div>
                        <strong className="food-cell-name">{food.name}</strong>
                        <p className="food-cell-desc">{food.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{food.category?.name || 'Unassigned'}</td>
                  <td className="bold-cell tabular-nums">NPR {food.price}</td>
                  <td>{food.preparationTimeMinutes || 20} mins</td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(food)}
                      className={`avail-toggle-btn ${food.isAvailable ? 'available' : 'unavailable'}`}
                    >
                      {food.isAvailable ? <Check size={14} /> : <X size={14} />}
                      <span>{food.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button onClick={() => handleOpenEdit(food)} className="icon-action-btn edit" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(food)} className="icon-action-btn delete" title="Delete or Deactivate">
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

      {/* Food Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box food-modal">
            <div className="modal-head">
              <h3>{editingFood ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="form-group">
                <label>Food Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Cheeseburger"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price in NPR *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="350"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Local Image Path</label>
                  <input
                    type="text"
                    placeholder="/images/burger.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Prep Time (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe meal ingredients, flavors, allergens..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span>Mark as Available for Ordering</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" className="modal-confirm-btn">
                  {editingFood ? 'Save Changes' : 'Create Food Item'}
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

export default AdminFoodsPage;
