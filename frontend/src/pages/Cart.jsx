import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import Navbar from '../components/Navbar';

export default function Cart() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, totalCartItems } = useCart();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = totalCartItems > 0 ? 30 : 0;
  const orderTotal = grandTotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart', proceedToCheckout: true } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#7A153B] text-white pb-24 sm:pb-8 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow w-full max-w-md mx-auto px-4 box-border md:max-w-2xl pt-5 pb-8">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#2A082D] flex items-center justify-center border border-[#F39C12]/30 shadow-md text-[#F39C12] cursor-pointer hover:bg-[#330D3A] transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold text-white font-serif tracking-tight">Shopping Bag</h1>
          <div className="w-10" />
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 bg-[#330D3A] border border-[#F39C12]/30 rounded-3xl shadow-xl text-center"
          >
            <div className="w-16 h-16 bg-[#2A082D] rounded-full flex items-center justify-center mb-4 border border-[#F39C12]/20">
              <svg className="w-8 h-8 text-[#F39C12]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-1 font-serif">Your shopping bag is empty</h2>
            <p className="text-[#E2B6DC] text-xs max-w-xs mb-6 leading-relaxed">
              Looks like you haven't added any bridal sets to your cart yet. Explore our handcrafted collections!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-[#F39C12] text-[#2A082D] text-xs font-extrabold rounded-full cursor-pointer shadow-md hover:bg-[#D68910]"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items stack */}
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="relative flex items-center gap-4 p-4 bg-[#330D3A] border border-[#F39C12]/30 rounded-3xl shadow-xl hover:border-[#F39C12]/60 transition-all group cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  >
                    {/* Delete Cross Button */}
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="absolute top-3.5 right-3.5 text-[#F39C12]/70 hover:text-white p-1 cursor-pointer"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#2A082D] shrink-0 border border-[#F39C12]/20">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
                        }}
                      />
                    </div>

                    {/* Details and Counter block */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="space-y-1.5 min-w-0 flex-grow">
                        <h3 className="text-sm font-bold text-white font-serif truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[240px]">
                          {item.product.name}
                        </h3>
                        <p className="text-[10px] text-[#F39C12] font-semibold">
                          Category: {item.product.category || 'Bridal Couture'}
                        </p>
                        
                        {/* Counter pill */}
                        <div 
                          onClick={(e) => { e.stopPropagation(); }} 
                          className="flex items-center bg-[#2A082D] border border-[#F39C12]/30 rounded-full px-2 py-0.5 w-fit gap-3"
                        >
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-[#F39C12] disabled:opacity-30 cursor-pointer font-bold text-xs px-1"
                          >
                            -
                          </motion.button>
                          <span className="text-xs font-bold text-white min-w-3 text-center">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="text-[#F39C12] disabled:opacity-30 cursor-pointer font-bold text-xs px-1"
                          >
                            +
                          </motion.button>
                        </div>
                      </div>

                      {/* Right side Price Capsule */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-3 py-1 bg-[#2A082D] border border-[#F39C12]/40 text-xs font-extrabold text-[#F39C12] rounded-full shadow-xs">
                          ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Calculations Box */}
            <div className="bg-[#330D3A] p-6 rounded-[32px] border border-[#F39C12]/30 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-[#F39C12] font-serif tracking-widest uppercase mb-2">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-[#E2B6DC]">
                  <span>Item Total</span>
                  <span className="font-bold text-white">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-[#E2B6DC]">
                  <span>Express Shipping</span>
                  <span className="font-bold text-emerald-400">FREE</span>
                </div>
              </div>
              <div className="border-t border-[#F39C12]/20 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white font-serif">Grand Total</span>
                <span className="text-xl font-extrabold text-[#F39C12]">₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="p-3 bg-red-950/80 border border-red-500 rounded-2xl text-xs text-red-200 font-semibold text-center">{checkoutError}</div>
            )}

            {/* Solid Bottom Action CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleProceedToCheckout}
              disabled={isCheckingOut}
              className="w-full bg-[#F39C12] hover:bg-[#D68910] text-[#2A082D] font-extrabold py-4 rounded-full shadow-2xl transition-all cursor-pointer text-center text-xs uppercase tracking-widest mt-6 shadow-[#F39C12]/30"
            >
              Proceed to Checkout
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
}
