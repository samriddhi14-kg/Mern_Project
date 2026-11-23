import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">
            <ShoppingBag size={56} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything to your cart yet. Explore our delicious menu to find your favorites!</p>
          <Link to="/" className="browse-menu-btn">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page-container">
      <div className="cart-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Continue Shopping</span>
        </Link>
        <button onClick={clearCart} className="clear-cart-action">
          Clear All Items
        </button>
      </div>

      <h1 className="page-title">Your Food Cart</h1>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.foodId} className="cart-item-row">
              <img
                src={item.image || '/images/burger.jpg'}
                alt={item.name}
                className="cart-item-thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/burger.jpg';
                }}
              />

              <div className="cart-item-details">
                <Link to={`/food/${item.foodId}`} className="cart-item-name">
                  {item.name}
                </Link>
                <div className="cart-item-price tabular-nums">
                  NPR {item.price} each
                </div>
              </div>

              <div className="cart-item-qty">
                <button
                  onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                  className="cart-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="cart-qty-val tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                  className="cart-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="cart-item-total tabular-nums">
                NPR {item.price * item.quantity}
              </div>

              <button
                onClick={() => removeFromCart(item.foodId)}
                className="cart-remove-btn"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span className="summary-label">Subtotal</span>
            <span className="summary-val tabular-nums">NPR {subtotal}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Delivery Fee</span>
            <span className="summary-val tabular-nums">NPR {deliveryFee}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Grand Total</span>
            <span className="total-val tabular-nums">NPR {total}</span>
          </div>

          <div className="payment-note-badge">
            💵 Payment Method: <strong>Cash on Delivery (COD)</strong>
          </div>

          <button onClick={handleCheckoutClick} className="checkout-btn">
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
