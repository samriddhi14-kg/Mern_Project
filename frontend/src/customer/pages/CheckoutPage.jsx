import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, User, FileText, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ErrorMessage from '../../components/common/ErrorMessage';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    instructions: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDelivery((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!delivery.recipientName.trim()) {
      setError('Please provide recipient name.');
      return;
    }
    if (!delivery.phone.trim()) {
      setError('Please provide a valid delivery phone number.');
      return;
    }
    if (!delivery.address.trim()) {
      setError('Please enter delivery address.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: cartItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity
        })),
        delivery: {
          recipientName: delivery.recipientName.trim(),
          phone: delivery.phone.trim(),
          address: delivery.address.trim(),
          instructions: delivery.instructions.trim()
        },
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      const res = await api.createOrder(payload);

      if (res.success && res.data) {
        clearCart();
        navigate(`/orders/${res.data._id}`, {
          state: { isNewOrder: true }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please check availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-container">
      <Link to="/cart" className="back-link">
        <ArrowLeft size={18} />
        <span>Return to Cart</span>
      </Link>

      <h1 className="page-title">Checkout & Delivery Details</h1>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="checkout-layout">
        {/* Delivery Form */}
        <div className="delivery-form-card">
          <div className="card-header-row">
            <MapPin size={22} color="var(--color-accent)" />
            <h2>Delivery Address & Contact</h2>
          </div>

          <div className="form-group">
            <label htmlFor="recipientName">
              <User size={15} /> Recipient Name *
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={delivery.recipientName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <Phone size={15} /> Mobile Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="e.g. 9841000000"
              value={delivery.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">
              <MapPin size={15} /> Full Street Address *
            </label>
            <textarea
              id="address"
              name="address"
              rows="3"
              required
              placeholder="House/Apartment #, street name, landmark, area, city"
              value={delivery.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">
              <FileText size={15} /> Delivery Instructions (Optional)
            </label>
            <input
              id="instructions"
              name="instructions"
              type="text"
              placeholder="e.g. Ring the doorbell, leave at gate, or call upon arrival"
              value={delivery.instructions}
              onChange={handleChange}
            />
          </div>

          {/* Payment Method Section */}
          <div className="payment-selection-box">
            <div className="payment-head">
              <ShieldCheck size={20} color="var(--color-success)" />
              <h3>Payment Method</h3>
            </div>
            <div className="cod-option-selected">
              <input type="radio" id="cod" name="paymentMethod" defaultChecked readOnly />
              <label htmlFor="cod">
                <strong>Cash on Delivery (COD)</strong>
                <p>Pay cash in hand directly to our courier when your meals arrive at your door.</p>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <aside className="checkout-review-card">
          <h2>Order Items ({cartItems.length})</h2>

          <div className="checkout-items-mini">
            {cartItems.map((item) => (
              <div key={item.foodId} className="mini-item-row">
                <span className="mini-item-name">
                  {item.quantity} × {item.name}
                </span>
                <span className="mini-item-total tabular-nums">
                  NPR {item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span className="summary-label">Items Subtotal</span>
            <span className="summary-val tabular-nums">NPR {subtotal}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Standard Delivery</span>
            <span className="summary-val tabular-nums">NPR {deliveryFee}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Payable (COD)</span>
            <span className="total-val tabular-nums">NPR {total}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="place-order-btn"
          >
            {loading ? 'Processing Order...' : `Confirm & Place Order (NPR ${total})`}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
