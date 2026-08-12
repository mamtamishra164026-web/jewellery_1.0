import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart, ArrowLeft, ShoppingBag, Trash2, Eye, Plus, Minus, User, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Wishlist() {
  const { user, logout } = useAuth();
  const { cartItems, addToCart, updateQuantity, totalCartItems } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  // Load wishlist from local storage
  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    const ids = saved ? JSON.parse(saved) : [];
    setWishlistIds(ids);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch products and sync wishlist
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/api/products', {
          params: { page: 0, size: 100, sort: 'id,asc' },
        });
        setProducts(response.data.content);
      } catch (err) {
        console.error('Failed to load products for wishlist:', err);
        setError(err.response?.data?.message || 'Failed to connect to the store catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
    loadWishlist();

    // Listen for wishlist updates
    const handleUpdate = () => loadWishlist();
    window.addEventListener('wishlist-update', handleUpdate);
    return () => window.removeEventListener('wishlist-update', handleUpdate);
  }, []);

  const removeFromWishlist = (productId) => {
    const saved = localStorage.getItem('wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];
    wishlist = wishlist.filter((id) => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    setWishlistIds(wishlist);
    window.dispatchEvent(new Event('wishlist-update'));
  };

  // Filter products that exist in the wishlist IDs list
  const wishlistedProducts = products.filter((product) => wishlistIds.includes(product.id));

  // Framer Motion entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#7A153B] text-white pb-24 sm:pb-8">
      {/* ── Navigation Bar ── */}
      <Navbar />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white font-serif tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            My Wishlist
          </h1>
          <p className="text-pink-100/80 text-sm mt-2">
            Your saved royal bridal collections and items ready for checkout.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#330D3A] border border-pink-800/40 rounded-3xl overflow-hidden animate-pulse shadow-xl h-96" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-950/80 border border-red-500 text-red-200 rounded-2xl p-5 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlistedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-[#330D3A] border border-pink-800/40 rounded-3xl shadow-2xl px-4 text-white"
          >
            <div className="w-20 h-20 bg-[#2A082D] rounded-full flex items-center justify-center mb-6 border border-pink-800/40">
              <Heart className="w-10 h-10 text-rose-400 fill-rose-400/20" />
            </div>
            <h2 className="text-xl font-bold text-white font-serif mb-2">Your CreationHub Wishlist is empty.</h2>
            <p className="text-pink-100/80 text-center max-w-sm mb-8 text-xs leading-relaxed">
              Explore our handcrafted boutique gear and add your favorite Kaleeras, Choodas, and Kundan sets to your saved collection.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-full transition-all shadow-lg shadow-amber-400/25 cursor-pointer uppercase tracking-widest"
            >
              Browse Catalog
            </Link>
          </motion.div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlistedProducts.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 px-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {wishlistedProducts.map((product) => {
                const cartItem = cartItems.find((item) => item.product.id === product.id);

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    exit="exit"
                    layout
                    whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                    className="group bg-[#330D3A] rounded-3xl border border-pink-800/40 overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-400/50 flex flex-col h-full relative transition-all duration-300 cursor-pointer text-white"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(product.id); }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#2A082D]/80 hover:bg-rose-600 text-amber-300 hover:text-white shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer border border-pink-800/40"
                      title="Remove from Wishlist"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-[#2A082D] border-b border-pink-800/30">
                      <div className="w-full h-full block">
                        <img
                          src={product.imageUrl || fallbackImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                        />
                      </div>

                      {/* Stock Badge */}
                      {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                        <span className="absolute top-4 left-4 px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-extrabold rounded shadow-md">
                          ONLY {product.stockQuantity} LEFT
                        </span>
                      )}
                      {product.stockQuantity === 0 && (
                        <span className="absolute top-4 left-4 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded shadow-md">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                          {product.category || 'Bridal Collection'}
                        </span>
                        <h3 className="font-serif font-bold text-white text-base leading-snug line-clamp-2">
                          {product.name}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-pink-800/30 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-amber-300">
                          ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                        {cartItem ? (
                          <div className="flex items-center justify-between bg-[#2A082D] p-1.5 rounded-xl border border-pink-800/40">
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-amber-300 hover:bg-[#330D3A] rounded-lg font-bold text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-white">{cartItem.quantity} in Bag</span>
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                              disabled={cartItem.quantity >= product.stockQuantity}
                              className="w-8 h-8 flex items-center justify-center text-amber-300 hover:bg-[#330D3A] rounded-lg font-bold text-sm disabled:opacity-30 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id, 1)}
                            disabled={product.stockQuantity === 0}
                            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Move to Bag
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
