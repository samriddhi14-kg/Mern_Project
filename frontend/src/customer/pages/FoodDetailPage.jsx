import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Clock, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './FoodDetailPage.css';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();

  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      setLoading(false);
      const res = await api.getFoodById(id);
      if (res.success) {
        setFood(res.data);
      }
    } catch (err) {
      setError(err.message || 'Food item not found.');
    } finally {
      setLoading(false);
    }
  };

  const inCart = cartItems.find((item) => item.foodId === id);

  const handleAdd = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please log in or sign up to add meals to your cart.'
        }
      });
      return;
    }

    if (food && food.isAvailable) {
      addToCart(food, quantity);
    }
  };

  if (loading) return <Loading fullPage text="Loading meal details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchFood} />;
  if (!food) return null;

  return (
    <div className="container food-detail-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        <span>Back to Menu</span>
      </Link>

      <div className="food-detail-card">
        <div className="food-detail-media">
          <img
            src={food.image || '/images/burger.jpg'}
            alt={food.name}
            className="food-detail-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/burger.jpg';
            }}
          />
          {!food.isAvailable && (
            <div className="detail-unavailable-badge">Sold Out / Unavailable</div>
          )}
        </div>

        <div className="food-detail-info">
          {food.category && (
            <span className="category-tag">{food.category.name}</span>
          )}

          <h1 className="food-detail-title">{food.name}</h1>

          <div className="detail-meta-row">
            <div className="detail-price tabular-nums">
              <span className="npr-label">NPR</span> {food.price}
            </div>
            <div className="prep-time-badge">
              <Clock size={16} />
              <span>{food.preparationTimeMinutes || 20} mins prep</span>
            </div>
          </div>

          <div className="detail-desc-block">
            <h3>Description</h3>
            <p>{food.description || 'Prepared fresh with high quality ingredients upon receiving your order.'}</p>
          </div>

          <div className="detail-actions">
            {food.isAvailable ? (
              <>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-number tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="qty-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button onClick={handleAdd} className="detail-add-btn">
                  <ShoppingBag size={18} />
                  <span>
                    Add to Cart • NPR {food.price * quantity}
                  </span>
                </button>

                {inCart && (
                  <Link to="/cart" className="view-cart-action">
                    <Check size={16} color="var(--color-success)" />
                    <span>In Cart ({inCart.quantity}). View Cart &rarr;</span>
                  </Link>
                )}
              </>
            ) : (
              <div className="sold-out-box">
                This item is currently sold out. Please explore our other menu items!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;
