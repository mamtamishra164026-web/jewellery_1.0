import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const storedCart = localStorage.getItem('guest_cart');
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
      } catch (e) {
        console.error('Failed to parse guest cart:', e);
        setCartItems([]);
      }
      return;
    }
    try {
      const response = await API.get('/api/cart');
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const mergeGuestCart = useCallback(async () => {
    try {
      const storedCart = localStorage.getItem('guest_cart');
      if (!storedCart) return;
      const guestItems = JSON.parse(storedCart);
      if (!Array.isArray(guestItems) || guestItems.length === 0) return;

      const mergePayload = guestItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const response = await API.post('/api/cart/merge', mergePayload);
      localStorage.removeItem('guest_cart');
      setCartItems(Array.isArray(response.data) ? response.data : []);
      showToast('Guest cart successfully merged with your account.');
    } catch (err) {
      console.error('Failed to merge guest cart:', err);
      showToast('Failed to merge guest cart.');
      setCartItems([]);
    }
  }, []);

  // Automatic merge trigger on login transition
  useEffect(() => {
    if (isAuthenticated) {
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart && JSON.parse(storedCart).length > 0) {
        mergeGuestCart();
      } else {
        fetchCart();
      }
    } else {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart, mergeGuestCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      try {
        const response = await API.get(`/api/products/${productId}`);
        const product = response.data;

        const storedCart = localStorage.getItem('guest_cart');
        let guestItems = storedCart ? JSON.parse(storedCart) : [];

        const existingItemIndex = guestItems.findIndex(item => item.product.id === productId);
        if (existingItemIndex > -1) {
          const newQty = guestItems[existingItemIndex].quantity + quantity;
          if (newQty > product.stockQuantity) {
            showToast('Sorry, requested item quantity exceeds warehouse availability.');
            return false;
          }
          guestItems[existingItemIndex].quantity = newQty;
        } else {
          if (quantity > product.stockQuantity) {
            showToast('Sorry, requested item quantity exceeds warehouse availability.');
            return false;
          }
          guestItems.push({
            id: `guest_${productId}`,
            product,
            quantity
          });
        }

        localStorage.setItem('guest_cart', JSON.stringify(guestItems));
        setCartItems(guestItems);
        showToast('Item added to cart.');
        return true;
      } catch (err) {
        console.error('Guest add to cart failed:', err);
        showToast('Failed to add to cart.');
        return false;
      }
    }

    try {
      await API.post('/api/cart/add', { productId, quantity });
      fetchCart();
      return true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        showToast('Sorry, requested item quantity exceeds warehouse availability.');
      } else {
        showToast(err.response?.data?.message || 'Failed to add to cart');
      }
      return false;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return false;
    if (!isAuthenticated) {
      try {
        const storedCart = localStorage.getItem('guest_cart');
        let guestItems = storedCart ? JSON.parse(storedCart) : [];
        const itemIndex = guestItems.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
          const item = guestItems[itemIndex];
          if (newQuantity > item.product.stockQuantity) {
            showToast('Sorry, requested item quantity exceeds warehouse availability.');
            return false;
          }
          guestItems[itemIndex].quantity = newQuantity;
          localStorage.setItem('guest_cart', JSON.stringify(guestItems));
          setCartItems(guestItems);
          return true;
        }
        return false;
      } catch (e) {
        console.error('Failed to update guest quantity:', e);
        return false;
      }
    }

    try {
      await API.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
      return true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        showToast('Sorry, requested item quantity exceeds warehouse availability.');
      } else {
        showToast(err.response?.data?.message || 'Failed to update quantity');
      }
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      try {
        const storedCart = localStorage.getItem('guest_cart');
        let guestItems = storedCart ? JSON.parse(storedCart) : [];
        guestItems = guestItems.filter(item => item.id !== itemId);
        localStorage.setItem('guest_cart', JSON.stringify(guestItems));
        setCartItems(guestItems);
        return true;
      } catch (e) {
        console.error('Failed to remove guest item:', e);
        return false;
      }
    }

    try {
      await API.delete(`/api/cart/${itemId}`);
      fetchCart();
      return true;
    } catch (err) {
      console.error(err);
      showToast('Failed to remove item');
      return false;
    }
  };

  const totalCartItems = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item?.quantity || 1), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        totalCartItems,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
      {/* Global Error/Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-surface-card border border-border rounded-xl p-4 shadow-2xl shadow-black/30 flex items-center gap-3 min-w-72">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-text-primary cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
