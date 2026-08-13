import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Home, Heart, ShoppingBag, ClipboardList, Menu, X, MoreVertical, User, LogOut, Info, Search } from 'lucide-react';
import { HiArrowLeft, HiOutlineCollection } from 'react-icons/hi';
import { getCategoryColor } from '../data/mockData';
import API from '../services/api';

export default function Navbar({ backToStore = false, onSelectCategory }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalCartItems, searchQuery, setSearchQuery } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [navCategories, setNavCategories] = useState(['All', 'Kaleera', 'Chooda', 'Bridal Jewellery', 'Hair Accessories']);

  const loadNavCategories = useCallback(() => {
    try {
      const saved = localStorage.getItem('creation_categories_config');
      let catList = ['Kaleera', 'Chooda', 'Bridal Jewellery', 'Hair Accessories'];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          catList = parsed.map(c => c.name).filter(Boolean);
        }
      }
      API.get('/api/products?size=100').then(res => {
        if (res.data?.content && Array.isArray(res.data.content)) {
          const productCats = res.data.content.map(p => p.category).filter(Boolean);
          const unique = ['All', ...new Set([...catList, ...productCats])];
          setNavCategories(unique);
        } else {
          setNavCategories(['All', ...new Set(catList)]);
        }
      }).catch(() => {
        setNavCategories(['All', ...new Set(catList)]);
      });
    } catch (e) {
      setNavCategories(['All', 'Kaleera', 'Chooda', 'Bridal Jewellery', 'Hair Accessories']);
    }
  }, []);

  useEffect(() => {
    loadNavCategories();
    window.addEventListener('categories-update', loadNavCategories);
    return () => window.removeEventListener('categories-update', loadNavCategories);
  }, [loadNavCategories]);

  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const searchRef = useRef(null);

  // Admin Live Order Alert State
  const [placedOrdersCount, setPlacedOrdersCount] = useState(0);
  const prevPlacedCountRef = useRef(0);
  const isAdmin = isAuthenticated && (user?.role === 'ROLE_ADMIN' || user?.username === 'admin');

  // Request Web Notification permission for Admin
  useEffect(() => {
    if (isAdmin && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAdmin]);

  // Audio Chime Synth using Web Audio API
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio chime exception:', e);
    }
  };

  // Poll for PLACED orders every 8 seconds
  useEffect(() => {
    if (!isAdmin) return;

    const checkPlacedOrders = async () => {
      try {
        const res = await API.get('/api/admin/orders');
        const orders = res.data || [];
        const newCount = orders.filter(o => (o.orderStatus || 'PLACED') === 'PLACED').length;

        if (newCount > prevPlacedCountRef.current && prevPlacedCountRef.current !== 0) {
          playOrderChime();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 New Order Received!', {
              body: `You have ${newCount} new order(s) awaiting fulfillment in Admin Panel.`,
              icon: '/favicon.ico'
            });
          }
        }
        prevPlacedCountRef.current = newCount;
        setPlacedOrdersCount(newCount);
      } catch (err) {
        // Ignore network errors during polling
      }
    };

    checkPlacedOrders();
    const interval = setInterval(checkPlacedOrders, 8000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Sync external search query updates
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  // Click outside to close suggestion dropdown & category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 300ms Debounced fetch suggestions
  useEffect(() => {
    if (inputValue.trim().length <= 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await API.get('/api/public/products/search/suggestions', {
          params: { query: inputValue }
        });
        setSuggestions(res.data || []);
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);
    setShowDropdown(true);
  };

  const updateWishlistCount = () => {
    const saved = localStorage.getItem('wishlist');
    const wishlist = saved ? JSON.parse(saved) : [];
    setWishlistCount(wishlist.length);
  };

  useEffect(() => {
    updateWishlistCount();
    window.addEventListener('wishlist-update', updateWishlistCount);
    return () => window.removeEventListener('wishlist-update', updateWishlistCount);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    } else {
      navigate(`/?category=${encodeURIComponent(catName)}`);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ── TOP HEADER / NAVBAR (Jamun Purple #3B0A45) ── */}
      <nav className="border-b border-[#F39C12]/20 bg-[#3B0A45]/95 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {location.pathname !== '/' && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 rounded-lg text-[#F39C12] hover:bg-[#2A0835] hover:text-white transition-all cursor-pointer mr-1"
                  aria-label="Go Back"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B005D] via-[#3B0A45] to-[#F39C12] flex items-center justify-center shadow-lg shadow-black/30 border border-[#F39C12]/30">
                  <span className="text-white text-xs font-serif font-bold">C</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif tracking-wider text-xl font-extrabold text-white group-hover:text-[#F39C12] transition-colors">
                    Creation<span className="text-[#F39C12]">Hub</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-[#F39C12] uppercase font-sans -mt-1">Bridal Couture</span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar in Jamun Dark (#2A0835) */}
            {location.pathname === '/' && (
              <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-auto px-4 relative">
                <div className="flex items-center gap-2 w-full bg-[#2A0835] border border-[#F39C12]/30 rounded-full px-4 py-2 hover:border-[#F39C12] transition-all duration-300 focus-within:border-[#F39C12] focus-within:ring-2 focus-within:ring-[#F39C12]/30 shadow-inner">
                  <Search className="w-4 h-4 text-[#F39C12] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Kaleera, Chooda, Bridal Sets..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full bg-transparent border-0 outline-none text-white placeholder-[#E2B6DC]/60 text-xs focus:ring-0 focus:outline-none"
                  />
                  {inputValue && (
                    <button
                      onClick={() => {
                        setInputValue('');
                        setSearchQuery('');
                        setSuggestions([]);
                      }}
                      className="p-0.5 rounded-full text-[#F39C12]/70 hover:bg-[#8B005D] hover:text-white transition-all cursor-pointer flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions */}
                {showDropdown && (suggestions.length > 0 || loadingSuggestions) && (
                  <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-[#F39C12]/30 shadow-2xl shadow-black/60 max-h-60 overflow-y-auto bg-[#2A0835]/98 backdrop-blur-md z-50 py-2">
                    {loadingSuggestions && suggestions.length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-[#F39C12] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/products/${product.id}`);
                            setShowDropdown(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#3B0A45] transition-colors cursor-pointer"
                        >
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=40&q=80'}
                            alt=""
                            className="w-8 h-8 object-cover rounded-lg border border-[#F39C12]/30 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{product.productName}</p>
                            <p className="text-[10px] text-[#F39C12] font-bold">₹{Number(product.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Actions Matrix */}
            <div className="hidden md:flex items-center gap-3">
              {backToStore && (
                <Link to="/" className="text-sm font-semibold text-[#F39C12] hover:text-white transition-colors mr-2">
                  Back to Store
                </Link>
              )}

              {/* Wishlist Link */}
              {user?.role !== 'ROLE_ADMIN' && (
                <Link
                  to="/wishlist"
                  className="relative p-2 text-[#F39C12] hover:text-white hover:bg-[#2A0835] rounded-xl transition-all border border-[#F39C12]/20 bg-[#3B0A45] shadow-md flex items-center gap-1.5"
                  title="Wishlist"
                >
                  <Heart className="w-4.5 h-4.5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B005D] text-[8px] font-bold text-white ring-2 ring-[#3B0A45]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* My Orders Link */}
              {user?.role !== 'ROLE_ADMIN' && (
                <Link
                  to="/orders"
                  className="relative px-3 py-1.5 text-[#F39C12] hover:text-white hover:bg-[#2A0835] rounded-xl transition-all border border-[#F39C12]/20 bg-[#3B0A45] shadow-md flex items-center gap-1.5"
                  title="My Orders"
                >
                  <HiOutlineCollection className="w-4 h-4" />
                  <span className="text-xs font-bold">My Orders</span>
                </Link>
              )}

              {/* Cart Link */}
              {user?.role !== 'ROLE_ADMIN' && (
                <Link
                  to="/cart"
                  className="relative px-3 py-1.5 text-[#F39C12] hover:text-white hover:bg-[#2A0835] rounded-xl transition-all border border-[#F39C12]/20 bg-[#3B0A45] shadow-md flex items-center gap-1.5"
                  title="Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-bold">Cart</span>
                  {totalCartItems > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#F39C12] text-[9px] font-black text-[#2A0835]">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Admin Console Link & Live Glowing Red Order Alert Badge */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  {placedOrdersCount > 0 && (
                    <button
                      onClick={() => navigate('/admin?tab=orders')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black tracking-wider shadow-lg shadow-red-600/50 animate-pulse border border-red-300 cursor-pointer transition-all hover:scale-105"
                      title="Click to view new orders in fulfillment console"
                    >
                      <span>🚨 {placedOrdersCount} NEW ORDER{placedOrdersCount > 1 ? 'S' : ''}!</span>
                      <span className="bg-white text-red-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">View →</span>
                    </button>
                  )}
                  <Link
                    to="/admin"
                    className="px-3.5 py-1.5 text-xs font-bold text-[#F39C12] border border-[#F39C12]/40 bg-[#2A0835] hover:bg-[#8B005D] hover:text-white rounded-xl transition-all"
                  >
                    Admin Console
                  </Link>
                </div>
              )}

              {/* User Profile Badge */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 pl-2 border-l border-[#F39C12]/20">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-8 h-8 bg-[#F39C12] hover:bg-[#D68910] rounded-full flex items-center justify-center text-[#2A0835] text-xs font-bold font-serif shadow-md cursor-pointer transition-colors border border-white"
                    title="My Profile"
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        desktopDropdownOpen ? 'bg-[#2A0835] text-[#F39C12]' : 'text-[#F39C12]/70 hover:bg-[#2A0835] hover:text-[#F39C12]'
                      }`}
                      title="Account Menu"
                    >
                      <MoreVertical className="w-4.5 h-4.5" />
                    </button>

                    {/* Desktop Account Dropdown Card */}
                    {desktopDropdownOpen && (
                      <div className="absolute right-0 top-10 w-48 bg-[#2A0835] border border-[#F39C12]/30 shadow-2xl rounded-2xl p-1.5 z-50 animate-slide-up flex flex-col gap-1">
                        {user?.role !== 'ROLE_ADMIN' && (
                          <>
                            <button
                              onClick={() => { setDesktopDropdownOpen(false); navigate('/cart'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                            >
                              <ShoppingBag className="w-4 h-4 text-[#F39C12]" />
                              Shopping Cart {totalCartItems > 0 ? `(${totalCartItems})` : ''}
                            </button>
                            <button
                              onClick={() => { setDesktopDropdownOpen(false); navigate('/wishlist'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                            >
                              <Heart className="w-4 h-4 text-rose-400" />
                              My Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
                            </button>
                            <button
                              onClick={() => { setDesktopDropdownOpen(false); navigate('/orders'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                            >
                              <ClipboardList className="w-4 h-4 text-[#F39C12]" />
                              My Orders
                            </button>
                            <div className="border-t border-[#F39C12]/20 my-0.5" />
                          </>
                        )}
                        {user?.role === 'ROLE_ADMIN' && (
                          <button
                            onClick={() => { setDesktopDropdownOpen(false); navigate('/admin'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F39C12] hover:bg-[#3B0A45] font-extrabold rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Admin Console
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            document.getElementById("brand-story")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Info className="w-4 h-4 text-[#F39C12]" />
                          About Brand
                        </button>
                        <button
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-900/40 font-bold rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#2A0835] bg-[#F39C12] hover:bg-[#D68910] rounded-xl transition-all shadow-md shadow-[#F39C12]/20"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Header Menu */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Wishlist Link */}
              {user?.role !== 'ROLE_ADMIN' && (
                <Link
                  to="/wishlist"
                  className="relative p-2 text-[#F39C12] hover:text-white rounded-xl transition-all"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B005D] text-[8px] font-bold text-white ring-2 ring-[#3B0A45]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile Cart Link */}
              {user?.role !== 'ROLE_ADMIN' && (
                <Link
                  to="/cart"
                  className="relative p-2 text-[#F39C12] hover:text-white rounded-xl transition-all"
                  title="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalCartItems > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#F39C12] text-[8px] font-bold text-[#2A0835] ring-2 ring-[#3B0A45]">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#F39C12] hover:bg-[#2A0835] rounded-xl transition-colors cursor-pointer relative"
              >
                {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <MoreVertical className="w-5.5 h-5.5" />}
              </button>

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute right-4 top-14 w-48 bg-[#2A0835] border border-[#F39C12]/30 shadow-2xl rounded-2xl p-2 z-50 animate-slide-up flex flex-col gap-1">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 border-b border-[#F39C12]/20 mb-1">
                        <p className="text-[10px] text-[#F39C12] font-bold uppercase tracking-wider">Active Session</p>
                        <p className="text-xs font-bold text-white truncate">@{user?.username}</p>
                      </div>
                      
                      <button
                        onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-[#F39C12]" />
                        My Profile
                      </button>

                      {user?.role !== 'ROLE_ADMIN' && (
                        <>
                          <button
                            onClick={() => { setMobileMenuOpen(false); navigate('/cart'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#F39C12]" />
                            Shopping Cart {totalCartItems > 0 ? `(${totalCartItems})` : ''}
                          </button>

                          <button
                            onClick={() => { setMobileMenuOpen(false); navigate('/wishlist'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <Heart className="w-4 h-4 text-rose-400" />
                            My Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
                          </button>

                          <button
                            onClick={() => { setMobileMenuOpen(false); navigate('/orders'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <ClipboardList className="w-4 h-4 text-[#F39C12]" />
                            My Orders
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setTimeout(() => {
                            document.getElementById("brand-story")?.scrollIntoView({ behavior: "smooth" });
                          }, 50);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Info className="w-4 h-4 text-[#F39C12]" />
                        About Brand
                      </button>

                      {user?.role === 'ROLE_ADMIN' && (
                        <button
                          onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F39C12] hover:bg-[#3B0A45] font-extrabold rounded-xl transition-colors text-left"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-900/40 font-bold rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-[#3B0A45] font-bold rounded-xl transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[#F39C12]" />
                      Sign In
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── SECONDARY NAVBAR CATEGORIES STRIP (#2A0835 Deep Jamun) ── */}
        <div className="bg-[#2A0835] border-t border-[#F39C12]/30 text-white shadow-md w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
            <div className="flex items-center justify-between h-10 overflow-x-auto no-scrollbar gap-2 text-xs font-bold font-sans w-full max-w-full">
              <div className="flex items-center gap-1 sm:gap-4">
                {navCategories.map((catName) => (
                  <button
                    key={catName}
                    onClick={() => handleCategoryClick(catName)}
                    className="px-3 py-1 rounded-full text-[#F39C12] hover:text-white hover:bg-[#3B0A45] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                  >
                    {catName === 'All' ? (
                      <span className="text-white hover:text-[#F39C12]">All Collections</span>
                    ) : (
                      <>
                        <span className={`w-2 h-2 rounded-full ${getCategoryColor(catName)}`}></span>
                        <span>{catName}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[10px] tracking-wider text-[#F39C12] uppercase font-serif">
                <span>✦ Handcrafted Luxury Bridal Sets</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── STICKY FLOATING PINTEREST-STYLE BOTTOM NAVBAR WITH HIGH CONTRAST & GOLD GLOW ── */}
      <div className="md:hidden">
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#1E0522]/95 text-white backdrop-blur-xl border-2 border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.85)] rounded-full px-5 py-2.5 z-50 flex items-center justify-around">
          
          {user?.role === 'ROLE_ADMIN' ? (
            <>
              <Link
                to="/"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  location.pathname === '/' ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
                title="Storefront"
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Store</span>
              </Link>

              <Link
                to="/admin"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  location.pathname.startsWith('/admin') && !location.hash.includes('orders') ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
                title="Admin Console"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Admin</span>
              </Link>

              <button
                onClick={() => {
                  navigate('/admin?tab=orders');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all cursor-pointer relative ${
                  placedOrdersCount > 0
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black animate-pulse shadow-lg shadow-red-600/50 px-3 border border-amber-300'
                    : location.pathname.startsWith('/admin') && location.search.includes('tab=orders')
                    ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3'
                    : 'text-amber-300 hover:text-white'
                }`}
                title="Fulfillment"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 014 0m10 0a2 2 0 104 0m-4 0a2 2 0 014 0" />
                  </svg>
                  {placedOrdersCount > 0 && (
                    <span className="absolute -top-2 -right-3.5 px-1.5 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-full border-2 border-slate-950 animate-bounce shadow-md">
                      🚨 {placedOrdersCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold mt-0.5">Orders {placedOrdersCount > 0 ? `(${placedOrdersCount})` : ''}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  location.pathname === '/' ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Home</span>
              </Link>

              <Link
                to="/wishlist"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  location.pathname === '/wishlist' ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Saved</span>
              </Link>

              <Link
                to="/cart"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all relative ${
                  location.pathname === '/cart' ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Cart</span>
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-slate-950 ring-2 ring-[#1E0522]">
                    {totalCartItems}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  location.pathname === '/orders' || location.pathname === '/order-success' ? 'text-slate-950 bg-amber-400 shadow-md font-bold scale-105 px-3' : 'text-amber-300 hover:text-white'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Orders</span>
              </Link>
            </>
          )}

        </div>
      </div>
    </>
  );
}
