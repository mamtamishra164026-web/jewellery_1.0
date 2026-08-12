import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity } = useCart();
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

        {/* Price & Action Row */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-pink-800/20 mt-auto">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">Price</span>
            <span className="text-lg font-extrabold text-amber-300 leading-tight">
              ₹{Number(product.price).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Add to Cart or Quantity Controls */}
          <div className="relative hidden md:block">
            {user?.role === 'ROLE_ADMIN' ? (
              <span className="px-3 py-1.5 bg-[#2A082D] border border-pink-800/40 text-amber-300 text-[11px] font-bold rounded-xl tracking-wide select-none shadow-inner">
                Admin View
              </span>
            ) : cartItem ? (
              <div className="flex items-center gap-1 bg-[#2A082D] border border-pink-800/40 rounded-xl p-0.5 shadow-xs">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                  disabled={cartItem.quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-amber-300 hover:bg-[#330D3A] hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer font-semibold shadow-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-white">{cartItem.quantity}</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                  disabled={cartItem.quantity >= product.stockQuantity}
                  className="w-7 h-7 flex items-center justify-center text-amber-300 hover:bg-[#330D3A] hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer font-semibold shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); }}
                  disabled={product.stockQuantity === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-extrabold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-400/20 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); navigate('/cart'); }}
                  disabled={product.stockQuantity === 0}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-[#7A153B] hover:bg-[#5E102E] active:scale-95 text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#7A153B]/40 transition-all"
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
