import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Check, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const inCart = cartItems.find(item => item.foodId === food._id);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please log in or sign up to add meals to your cart.'
        }
      });
      return;
    }

    if (food.isAvailable) {
      addToCart(food, 1);
    }
  };

  return (
    <div className={`food-card ${!food.isAvailable ? 'unavailable' : ''}`}>
      <Link to={`/food/${food._id}`} className="food-card-media">
        <img
          src={food.image || '/images/burger.jpg'}
          alt={food.name}
          className="food-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/burger.jpg';
          }}
        />
        {!food.isAvailable && (
          <div className="unavailable-overlay">
            <span>Sold Out</span>
          </div>
        )}
        {food.category && (
          <span className="food-category-chip">{food.category.name}</span>
        )}
      </Link>

      <div className="food-card-body">
        <div className="food-card-header">
          <Link to={`/food/${food._id}`}>
            <h3 className="food-title">{food.name}</h3>
          </Link>
          <div className="food-prep-time">
            <Clock size={14} />
            <span>{food.preparationTimeMinutes || 20}m</span>
          </div>
        </div>

        <p className="food-desc">{food.description}</p>

        <div className="food-card-footer">
          <div className="food-price-wrap">
            <span className="currency-label">NPR</span>
            <span className="price-amount tabular-nums">{food.price}</span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!food.isAvailable}
            className={`add-cart-btn ${inCart ? 'in-cart' : ''}`}
            aria-label={`Add ${food.name} to cart`}
          >
            {inCart ? (
              <>
                <Check size={16} />
                <span>Added ({inCart.quantity})</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
