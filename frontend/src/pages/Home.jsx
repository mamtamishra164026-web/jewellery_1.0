import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Heart, SlidersHorizontal, ShoppingBag, User, LogOut, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { RiAppsLine, RiSmartphoneLine, RiHeadphoneLine, RiGamepadLine, RiWirelessChargingLine } from 'react-icons/ri';
import { categories, getCategoryIcon } from '../data/mockData';

/* ──────────────────────────────────────────
   Skeleton Card — shown while loading
   ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden animate-pulse shadow-sm">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-full" />
        <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-4">
          <div className="h-6 bg-slate-100 rounded-lg w-16" />
          <div className="h-9 bg-slate-100 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Error Fallback — shown when backend is down
   ────────────────────────────────────────── */
function ErrorFallback({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Products</h2>
      <p className="text-slate-500 text-center max-w-sm mb-6 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-2xl cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────
   Empty State — no products matching search
   ────────────────────────────────────────── */
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center mb-6 border border-indigo-50">
        <ShoppingBag className="w-10 h-10 text-indigo-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">No Matching Products</h2>
      <p className="text-slate-500 text-center max-w-sm mb-6 text-sm">
        We couldn't find anything matching your filters or query. Try adjusting your search query or selecting a different category.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl cursor-pointer transition-all"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME PAGE — Main Component
   ══════════════════════════════════════════ */
export default function Home() {
  const { user, logout } = useAuth();
  const { totalCartItems, searchQuery, setSearchQuery } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting & selection states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Sync category from URL search params if present (e.g. /?category=Kaleera)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [location.search]);

  // Wishlist count state
  const [wishlistCount, setWishlistCount] = useState(0);

  // Pagination properties
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProducts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/products', {
        params: { page: pageNum, size: 100, sort: 'id,asc' },
      });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setPage(pageNum);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError("Server Connection Failure. Please refresh the page or try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWishlistCount = () => {
    const saved = localStorage.getItem('wishlist');
    const wishlist = saved ? JSON.parse(saved) : [];
    setWishlistCount(wishlist.length);
  };

  useEffect(() => {
    fetchProducts(0);
    updateWishlistCount();
    window.addEventListener('wishlist-update', updateWishlistCount);
    return () => window.removeEventListener('wishlist-update', updateWishlistCount);
  }, [fetchProducts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('default');
  };

  // Client-side immediate filtering & sorting logic
  const filteredProducts = products
    .filter((product) => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const categoryTextMatch = product.category?.toLowerCase().includes(query);
      return categoryMatch && (nameMatch || descMatch || categoryTextMatch);
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const [sections, setSections] = useState([]);

  const loadSectionsConfig = useCallback(() => {
    try {
      const saved = localStorage.getItem('creation_sections_config');
      if (saved) {
        setSections(JSON.parse(saved));
      } else {
        setSections([
          {
            id: 1,
            name: "⭐ Featured Luxury Collections",
            priority: 1,
            active: true,
            productPriorities: {}
          }
        ]);
      }
    } catch (e) {
      console.error('Failed to load sections config:', e);
    }
  }, []);

  const [categoriesWithPhotos, setCategoriesWithPhotos] = useState([]);

  const loadCategoriesConfig = useCallback(() => {
    try {
      const saved = localStorage.getItem('creation_categories_config');
      let catMap = {
        'Kaleera': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80',
        'Chooda': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=200&q=80',
        'Bridal Jewellery': 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80',
        'Hair Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
      };

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(c => {
            if (c.name) catMap[c.name] = c.image || catMap[c.name] || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80';
          });
        }
      }

      const productCats = products.map(p => p.category).filter(Boolean);
      const uniqueNames = ['All', ...new Set([...Object.keys(catMap), ...productCats])];

      const list = uniqueNames.map(name => ({
        name,
        image: name === 'All' ? null : (catMap[name] || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80')
      }));

      setCategoriesWithPhotos(list);
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    loadCategoriesConfig();
    window.addEventListener('categories-update', loadCategoriesConfig);
    return () => window.removeEventListener('categories-update', loadCategoriesConfig);
  }, [loadCategoriesConfig]);

  useEffect(() => {
    loadSectionsConfig();
    window.addEventListener('sections-update', loadSectionsConfig);
    return () => window.removeEventListener('sections-update', loadSectionsConfig);
  }, [loadSectionsConfig]);

  return (
    <div className="min-h-screen bg-[#7A153B] text-white">
      {/* ── Navigation Bar ── */}
      <Navbar onSelectCategory={setSelectedCategory} />

      {/* ── Hero Banner (Floating Box Container) ── */}
      <Hero />

      {/* ── DYNAMIC FEATURED CUSTOM SECTIONS (Rendered if Category is 'All' and no search query) ── */}
      {selectedCategory === 'All' && !searchQuery && sections.filter(s => s.active).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 space-y-12">
          {sections
            .filter(s => s.active)
            .sort((a, b) => (a.priority || 99) - (b.priority || 99))
            .map((section) => {
              // Find assigned products for this section sorted by product priority
              const assignedProductIds = Object.keys(section.productPriorities || {});
              let sectionProducts = products.filter(p => assignedProductIds.includes(String(p.id)));
              
              // Fallback if no specific products assigned: display top rated/featured
              if (sectionProducts.length === 0) {
                sectionProducts = products.slice(0, 4);
              } else {
                sectionProducts.sort((a, b) => {
                  const prioA = section.productPriorities[a.id] || 99;
                  const prioB = section.productPriorities[b.id] || 99;
                  return prioA - prioB;
                });
              }

              if (sectionProducts.length === 0) return null;

              return (
                <div key={section.id} className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-pink-800/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 bg-amber-400 rounded-full" />
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight">
                        {section.name}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-[#2A082D] px-3 py-1 rounded-xl border border-pink-800/40">
                      {sectionProducts.length} Exclusive Items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sectionProducts.map((product) => (
                      <ProductCard
                        key={`sec-${section.id}-${product.id}`}
                        product={product}
                        onQuickView={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </section>
      )}

      {/* ── MAIN CATALOG CONTENT ── */}
      <motion.main 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-2"
      >

        {/* ── Filter & Sort Bar (Category Pills over #7A153B) ── */}
        <motion.div
          id="catalog-section"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#F39C12]/30 py-4 sm:py-5 mb-8 sm:mb-10"
        >
          {/* Category Filter Horizontal Photo Circle Strip */}
          <div className="w-full overflow-x-auto scrollbar-none py-3">
            <div className="flex items-center gap-3 sm:gap-6 min-w-max px-2">
              {categoriesWithPhotos.map((catObj) => {
                const catName = catObj.name;
                const isSelected = selectedCategory === catName;

                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`w-20 sm:w-24 shrink-0 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 p-1.5 rounded-2xl ${
                      isSelected ? 'scale-[1.05]' : 'hover:scale-[1.03]'
                    }`}
                  >
                    {/* Circular Category Photo Avatar */}
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 ring-4 ring-amber-400/40 shadow-xl shadow-amber-400/40'
                        : 'bg-gradient-to-tr from-amber-400/40 via-pink-700/50 to-amber-400/40 group-hover:from-amber-400 group-hover:to-pink-500 shadow-md'
                    }`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#2A082D] flex items-center justify-center relative shadow-inner">
                        {catName === 'All' ? (
                          <div className={`w-full h-full flex flex-col items-center justify-center ${isSelected ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-[#330D3A] text-amber-300'}`}>
                            <RiAppsLine className="w-6 h-6" />
                            <span className="text-[8px] uppercase font-extrabold tracking-widest mt-0.5">ALL</span>
                          </div>
                        ) : (
                          <img
                            src={catObj.image}
                            alt={catName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80';
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>
                    </div>

                    {/* Category Title */}
                    <span className={`text-[11px] sm:text-xs font-bold font-serif tracking-wide truncate w-full text-center px-0.5 transition-colors ${
                      isSelected ? 'text-amber-300 drop-shadow-md font-extrabold' : 'text-white/90 group-hover:text-amber-200'
                    }`}>
                      {catName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: count + sort */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0 px-4 sm:px-0">
            <span className="text-[10px] text-[#F39C12] font-bold tracking-widest uppercase">
              {filteredProducts.length} Items
            </span>

            <div className="flex items-center gap-1.5 bg-[#330D3A] border border-[#F39C12]/30 rounded-xl px-3 py-2 shadow-md">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F39C12]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-white outline-none focus:ring-0 focus:outline-none cursor-pointer pr-0.5"
              >
                <option value="default" className="bg-[#330D3A] text-white">Default</option>
                <option value="price-asc" className="bg-[#330D3A] text-white">Price: Low → High</option>
                <option value="price-desc" className="bg-[#330D3A] text-white">Price: High → Low</option>
                <option value="rating-desc" className="bg-[#330D3A] text-white">Best Rating</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ── Error State ── */}
        {error && !loading && (
          <ErrorFallback message={error} onRetry={() => fetchProducts(page)} />
        )}

        {/* ── Loading Skeleton Grid ── */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Products Grid with Staggered Entrance ── */}
        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && filteredProducts.length === 0 && (
          <EmptyState onClear={handleResetFilters} />
        )}
        </motion.main>

      {/* Premium Footer section */}
      <Footer />

      {/* ── Full Category Responsive Modal ── */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#330D3A] border border-[#F39C12]/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F39C12]/20 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#F39C12] font-serif">Explore Bridal Collections</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1 text-[#F39C12] hover:text-white hover:bg-[#2A082D] rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid listing ALL categories */}
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setIsCategoryModalOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer shadow-md ${
                      selectedCategory === cat.name
                        ? 'bg-[#F39C12] border-[#F39C12] text-[#2A082D] font-extrabold shadow-lg scale-102'
                        : 'bg-[#2A082D] border-[#F39C12]/30 text-white hover:bg-[#4A1355]'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center font-sans">{cat.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
