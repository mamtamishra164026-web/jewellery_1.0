import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  // Self-contained Wishlist state synced with localStorage
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    const wishlist = saved ? JSON.parse(saved) : [];
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem('wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];
    
    if (wishlist.includes(product.id)) {
      wishlist = wishlist.filter(id => id !== product.id);
      setIsWishlisted(false);
    } else {
      wishlist.push(product.id);
      setIsWishlisted(true);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-update'));
  };

  // Framer Motion staggered child motion variables
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-[#330D3A] rounded-3xl border border-pink-800/40 overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-400/50 flex flex-col h-full relative transition-all duration-300 cursor-pointer text-white"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#2A082D] border-b border-pink-800/30">
        {/* Wishlist Heart Button */}
        {user?.role !== 'ROLE_ADMIN' && (
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#2A082D]/80 hover:bg-rose-600 text-amber-300 hover:text-white shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer border border-pink-800/40"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-amber-300'
              }`}
            />
          </button>
        )}

        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />

        {/* Stock Status Badge */}
        {product.stockQuantity === 0 ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-lg backdrop-blur-md shadow-md uppercase tracking-wider">
            Out of Stock
          </span>
        ) : product.stockQuantity <= 5 ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded-lg backdrop-blur-md shadow-md uppercase tracking-wider">
            Only {product.stockQuantity} Left
          </span>
        ) : null}

        {/* Quick View Floating Button */}
        {onQuickView && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#2A082D]/90 hover:bg-[#330D3A] text-amber-300 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md shadow-lg border border-pink-800/40 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-5 flex flex-col flex-grow bg-[#330D3A]">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.category || 'General'}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors duration-200 font-serif">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Row (Option 2 with Smooth Morphing Quantity Bar) */}
        <div className="pt-3 border-t border-pink-800/20 mt-auto min-h-[52px] flex items-center justify-between relative">
          <AnimatePresence mode="wait">
            {user?.role === 'ROLE_ADMIN' ? (
              <div key="admin-view" className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">Price</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-300 leading-tight">
                    ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-[#2A082D] border border-pink-800/40 text-amber-300 text-[10px] font-bold rounded-xl tracking-wide select-none shadow-inner">
                  Admin View
                </span>
              </div>
            ) : cartItem ? (
              /* Added State: Glowing Full-Width Quantity Controller Bar */
              <motion.div
                key="qty-bar"
                initial={{ opacity: 0, scale: 0.92, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="flex items-center justify-between w-full bg-[#2A082D] border border-amber-400/40 rounded-2xl p-1.5 shadow-lg shadow-amber-400/10"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartItem.quantity > 1) {
                      updateQuantity(cartItem.id, cartItem.quantity - 1);
                    } else {
                      removeFromCart(cartItem.id);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center text-amber-300 bg-[#330D3A] hover:bg-rose-600 hover:text-white rounded-xl active:scale-90 transition-all cursor-pointer font-extrabold border border-pink-800/40 shadow-sm shrink-0"
                  title="Decrease Quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col items-center justify-center leading-none px-2 min-w-0">
                  <span className="text-sm font-black text-amber-300 font-mono tracking-tight">
                    {cartItem.quantity}
                  </span>
                  <span className="text-[9px] font-bold text-pink-100/80 uppercase tracking-widest mt-0.5">
                    IN BAG
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(cartItem.id, cartItem.quantity + 1);
                  }}
                  disabled={cartItem.quantity >= product.stockQuantity}
                  className="w-8 h-8 flex items-center justify-center text-amber-300 bg-[#330D3A] hover:bg-amber-400 hover:text-slate-950 rounded-xl disabled:opacity-30 active:scale-90 transition-all cursor-pointer font-extrabold border border-pink-800/40 shadow-sm shrink-0"
                  title="Increase Quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              /* Normal State: Price on Left + Compact Square Gold Cart Icon on Right */
              <motion.div
                key="normal-price"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between w-full"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">Price</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-300 leading-tight truncate">
                    ₹{Number(product.price).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product.id, 1);
                  }}
                  disabled={product.stockQuantity === 0}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/25 active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 border border-amber-300/40"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-950" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
