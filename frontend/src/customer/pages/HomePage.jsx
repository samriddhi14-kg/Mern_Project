import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Utensils, Flame } from 'lucide-react';
import { api } from '../../services/api';
import FoodCard from '../../components/food/FoodCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './HomePage.css';

const HomePage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [selectedCategory, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const catRes = await api.getCategories();
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getFoods({
        category: selectedCategory,
        search: searchTerm
      });
      if (res.success) {
        setFoods(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load food menu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="container hero-content">
          <div className="hero-badge">
            <Flame size={16} color="var(--color-accent)" />
            <span>Fast Fresh Delivery • Cash on Delivery</span>
          </div>
          <h1 className="hero-title">
            Craving Something <br />
            <span className="accent-gradient">Fresh & Flavorful?</span>
          </h1>
          <p className="hero-subtitle">
            Order restaurant-grade burgers, woodfired pizzas, crispy grills, and fresh salads straight to your doorstep.
          </p>

          {/* Search Bar */}
          <div className="hero-search-wrap">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by food name or ingredients (e.g., burger, pizza)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Menu & Category Navigation */}
      <section className="container menu-section">
        <div className="menu-header">
          <div className="menu-header-left">
            <h2 className="section-title">Explore Our Menu</h2>
            <p className="section-subtitle">Prepared fresh upon order with local quality ingredients</p>
          </div>

          {/* Category Filter Chips */}
          <div className="category-chips">
            <button
              onClick={() => setSelectedCategory('')}
              className={`cat-chip ${selectedCategory === '' ? 'active' : ''}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`cat-chip ${selectedCategory === cat.slug ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <Loading text="Loading delicious menu..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchFoods} />
        ) : foods.length === 0 ? (
          <div className="empty-menu">
            <Utensils size={48} className="empty-icon" />
            <h3>No meals found</h3>
            <p>Try clearing your search term or selecting another category.</p>
            {(selectedCategory || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                }}
                className="reset-filter-btn"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
