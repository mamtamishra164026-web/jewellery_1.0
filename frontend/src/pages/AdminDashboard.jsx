import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Trash2 } from 'lucide-react';
import OrdersFulfillmentTab from '../components/OrdersFulfillmentTab';
import API from '../services/api';

function AdminReviewsTab() {
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('ALL');

  const fetchAdminReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await API.get('/api/admin/reviews');
      setAdminReviews(res.data || []);
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await API.put(`/api/admin/reviews/${reviewId}/status`, { status: newStatus });
      fetchAdminReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/api/admin/reviews/${reviewId}`);
      fetchAdminReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const filtered = adminReviews.filter(r => reviewFilter === 'ALL' || r.status === reviewFilter);

  return (
    <div className="space-y-6 animate-slide-up text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-800/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">⭐ Customer Photo Reviews Moderation</h2>
          <p className="text-xs text-pink-100/70 mt-0.5">Inspect verified buyer ratings, approve customer photos, and manage store reviews.</p>
        </div>
        <button
          onClick={fetchAdminReviews}
          className="px-4 py-2 bg-[#2A082D] border border-pink-800/40 hover:border-amber-400/50 rounded-xl text-xs font-extrabold text-amber-300 transition-all cursor-pointer shadow-md"
        >
          Refresh Reviews
        </button>
      </div>

      {/* Filter status buttons */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setReviewFilter(st)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              reviewFilter === st
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md'
                : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:text-amber-300'
            }`}
          >
            {st} ({adminReviews.filter(r => st === 'ALL' || r.status === st).length})
          </button>
        ))}
      </div>

      {loadingReviews ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#330D3A] border border-pink-800/40 p-12 text-center rounded-2xl">
          <p className="text-pink-100/80 text-sm font-medium">No reviews match this filter status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rev) => (
            <div key={rev.id} className="bg-[#330D3A] border border-pink-800/40 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-base">{rev.username}</p>
                  <p className="text-xs text-amber-300 font-mono">Product ID: #{rev.productId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rev.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                  rev.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                  'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                }`}>
                  {rev.status}
                </span>
              </div>

              <div className="flex text-amber-400 text-sm">
                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
              </div>

              <p className="text-xs text-pink-100/90 leading-relaxed bg-[#2A082D] p-3 rounded-xl border border-pink-800/30">{rev.comment}</p>

              {rev.imageUrl && (
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">Customer Uploaded Photo</p>
                  <img src={rev.imageUrl} alt="Review" className="w-24 h-24 object-cover rounded-xl border border-amber-400/40 shadow-md" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-pink-800/30">
                {rev.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-md transition-all"
                  >
                    🟢 Approve
                  </button>
                )}
                {rev.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all"
                  >
                    🔴 Reject
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="px-3.5 py-1.5 bg-[#2A082D] border border-rose-800/50 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab navigation: 'analytics' | 'catalog' | 'orders' | 'add-product' | 'users'
  const [activeTab, setActiveTab] = useState('analytics');

  // Helper for processing Camera & Gallery image file uploads to Base64
  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size exceeds 5MB. Please pick a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (location.state?.activeTab === 'orders' || searchParams.get('tab') === 'orders') {
      setActiveTab('orders');
    }
  }, [location.state, location.search]);

  // Users state (for user role management)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Products state (for catalog tab)
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockProducts: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Add Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    category: '',
    rating: '4.8',
  });

  const DEFAULT_CATEGORIES = ['Kaleera', 'Chooda', 'Bridal Jewellery', 'Hair Accessories'];

  const getUniqueCategories = () => {
    const set = new Set(DEFAULT_CATEGORIES);
    categoriesConfig.forEach(c => {
      if (c.name && c.name.trim() !== '') set.add(c.name.trim());
    });
    products.forEach(p => {
      if (p.category && p.category.trim() !== '') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  };

  const [showNewCategoryField, setShowNewCategoryField] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPhoto, setNewCategoryPhoto] = useState('');
  
  const [showEditNewCategoryField, setShowEditNewCategoryField] = useState(false);
  const [editNewCategoryName, setEditNewCategoryName] = useState('');
  const [editNewCategoryPhoto, setEditNewCategoryPhoto] = useState('');

  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSelectedCategory, setCatalogSelectedCategory] = useState('All');

  // ── 1. BANNER ENGINE STATE ─────────────────────
  const [bannerConfig, setBannerConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('creation_banner_config');
      return saved ? JSON.parse(saved) : {
        badgeText: "ROYAL BRIDAL COUTURE COLLECTION",
        headingLine1: "Elevate Your Wedding Day",
        headingLine2: "Bridal Grace & Glamour",
        descriptionText: "Discover handcrafted golden Kaleeras, traditional Punjabi Choodas, grand Kundan & Polki bridal sets, and exquisite hair accessories tailored for every royal bride.",
        buttonText: "EXPLORE BRIDAL COLLECTIONS",
        slides: [
          {
            id: 1,
            productId: 1,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1dcIQ0vnQOG3PyZ8c1tApw3iwOZZXy3mQzSH4JjRsyrHP4ydYqc8KTRij&s=10",
            label: "Handcrafted Heritage",
            title: "Golden Ghungroo Kaleeras"
          },
          {
            id: 2,
            productId: 6,
            image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
            label: "Traditional Elegance",
            title: "Punjabi Designer Choodas"
          }
        ]
      };
    } catch (e) {
      return {
        badgeText: "ROYAL BRIDAL COUTURE COLLECTION",
        headingLine1: "Elevate Your Wedding Day",
        headingLine2: "Bridal Grace & Glamour",
        descriptionText: "Discover handcrafted golden Kaleeras, traditional Punjabi Choodas, grand Kundan & Polki bridal sets, and exquisite hair accessories tailored for every royal bride.",
        buttonText: "EXPLORE BRIDAL COLLECTIONS",
        slides: []
      };
    }
  });

  const [newSlide, setNewSlide] = useState({ image: '', label: '', title: '', productId: '' });

  const saveBannerConfig = (newConf) => {
    setBannerConfig(newConf);
    localStorage.setItem('creation_banner_config', JSON.stringify(newConf));
    window.dispatchEvent(new Event('banner-update'));
    alert('Banner Engine Settings Saved Successfully!');
  };

  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newSlide.image) {
      alert('Please provide a slide photo!');
      return;
    }
    const updatedSlides = [
      ...bannerConfig.slides,
      {
        id: Date.now(),
        image: newSlide.image,
        label: newSlide.label || 'Bridal Collection',
        title: newSlide.title || 'Luxury Design',
        productId: newSlide.productId || ''
      }
    ];
    const newConf = { ...bannerConfig, slides: updatedSlides };
    saveBannerConfig(newConf);
    setNewSlide({ image: '', label: '', title: '', productId: '' });
  };

  const handleDeleteSlide = (slideId) => {
    const updatedSlides = bannerConfig.slides.filter(s => s.id !== slideId);
    const newConf = { ...bannerConfig, slides: updatedSlides };
    saveBannerConfig(newConf);
  };

  // ── 2. CATEGORIES MANAGER STATE ───────────────
  const [categoriesConfig, setCategoriesConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('creation_categories_config');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'Kaleera', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80', active: true },
        { id: 2, name: 'Chooda', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=200&q=80', active: true },
        { id: 3, name: 'Bridal Jewellery', image: 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80', active: true },
        { id: 4, name: 'Hair Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', active: true }
      ];
    } catch (e) {
      return [];
    }
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [addCatForm, setAddCatForm] = useState({ name: '', image: '' });

  const saveCategoriesConfig = (newCats) => {
    setCategoriesConfig(newCats);
    localStorage.setItem('creation_categories_config', JSON.stringify(newCats));
    window.dispatchEvent(new Event('categories-update'));
  };

  // Auto-sync database product categories into categoriesConfig
  useEffect(() => {
    if (products && products.length > 0) {
      setCategoriesConfig(prevConfig => {
        const existingNames = new Set(prevConfig.map(c => c.name.toLowerCase()));
        let updated = [...prevConfig];
        let changed = false;

        products.forEach(p => {
          if (p.category && p.category.trim() !== '' && !existingNames.has(p.category.trim().toLowerCase())) {
            existingNames.add(p.category.trim().toLowerCase());
            updated.push({
              id: Date.now() + Math.random(),
              name: p.category.trim(),
              image: p.imageUrl || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80',
              active: true
            });
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('creation_categories_config', JSON.stringify(updated));
          window.dispatchEvent(new Event('categories-update'));
          return updated;
        }
        return prevConfig;
      });
    }
  }, [products]);

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!addCatForm.name.trim()) return;
    const catName = addCatForm.name.trim();
    if (categoriesConfig.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
      alert('Category already exists!');
      return;
    }
    const newCatObj = {
      id: Date.now(),
      name: catName,
      image: addCatForm.image || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80',
      active: true
    };
    const updated = [...categoriesConfig, newCatObj];
    saveCategoriesConfig(updated);
    setAddCatForm({ name: '', image: '' });
    alert(`Category "${catName}" added successfully!`);
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? Products in this category will be safely moved to "General".`)) return;
    
    setActionLoading(true);
    const updated = categoriesConfig.filter(c => c.id !== catId);
    saveCategoriesConfig(updated);

    // Safely re-assign any products belonging to this category to "General" and wait for all DB updates
    const updatePromises = products
      .filter(p => p.category === catName)
      .map(p => API.put(`/api/products/${p.id}`, { ...p, category: 'General' }));

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error reassigning products on category delete:', err);
    }

    await fetchProducts();
    setActionLoading(false);
    alert(`Category "${catName}" deleted. Assigned products moved to "General".`);
  };

  const handleSaveEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    const oldName = editingCategory.originalName;
    const newName = editingCategory.name.trim();
    const newImg = editingCategory.image;

    setActionLoading(true);

    const updated = categoriesConfig.map(c => c.id === editingCategory.id ? { ...c, name: newName, image: newImg } : c);
    saveCategoriesConfig(updated);

    if (oldName && oldName !== newName) {
      const updatePromises = products
        .filter(p => p.category === oldName)
        .map(p => API.put(`/api/products/${p.id}`, { ...p, category: newName }));

      try {
        await Promise.all(updatePromises);
      } catch (err) {
        console.error('Error updating products on category rename:', err);
      }

      await fetchProducts();
    }

    setActionLoading(false);
    setEditingCategory(null);
    alert('Category updated successfully!');
  };

  // ── 3. SECTIONS ENGINE STATE ───────────────────
  const [sectionsConfig, setSectionsConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('creation_sections_config');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          name: "⭐ Featured Luxury Collections",
          priority: 1,
          active: true,
          productPriorities: {}
        },
        {
          id: 2,
          name: "✨ New Arrivals",
          priority: 2,
          active: true,
          productPriorities: {}
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newSectionForm, setNewSectionForm] = useState({ name: '', priority: 1 });

  const saveSectionsConfig = (newSecs) => {
    setSectionsConfig(newSecs);
    localStorage.setItem('creation_sections_config', JSON.stringify(newSecs));
    window.dispatchEvent(new Event('sections-update'));
  };

  const handleAddSectionSubmit = (e) => {
    e.preventDefault();
    if (!newSectionForm.name.trim()) return;
    const newSec = {
      id: Date.now(),
      name: newSectionForm.name.trim(),
      priority: Number(newSectionForm.priority) || 1,
      active: true,
      productPriorities: {}
    };
    const updated = [...sectionsConfig, newSec];
    saveSectionsConfig(updated);
    setNewSectionForm({ name: '', priority: 1 });
    alert(`Section "${newSec.name}" created successfully!`);
  };

  const handleDeleteSection = (secId) => {
    if (!window.confirm('Are you sure you want to delete this custom showcase section?')) return;
    const updated = sectionsConfig.filter(s => s.id !== secId);
    saveSectionsConfig(updated);
  };

  const handleToggleSectionActive = (secId) => {
    const updated = sectionsConfig.map(s => s.id === secId ? { ...s, active: !s.active } : s);
    saveSectionsConfig(updated);
  };

  const handleSetProductPriorityInSection = (secId, productId, priorityNum) => {
    const updated = sectionsConfig.map(s => {
      if (s.id === secId) {
        const pPriorities = { ...(s.productPriorities || {}) };
        if (priorityNum > 0) {
          pPriorities[productId] = priorityNum;
        } else {
          delete pPriorities[productId];
        }
        return { ...s, productPriorities: pPriorities };
      }
      return s;
    });
    saveSectionsConfig(updated);
  };

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Customer History State
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleViewUserHistory = async (userObj) => {
    setSelectedUserForHistory(userObj);
    setHistoryLoading(true);
    setUserHistory([]);
    try {
      const response = await API.get(`/api/admin/users/${userObj.id}/history`);
      setUserHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch user history:', err);
      alert('Failed to load customer history logs.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastError, setBroadcastError] = useState('');

  // Broadcast campaign history state
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [historyFetching, setHistoryFetching] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchBroadcastHistory = useCallback(async () => {
    setHistoryFetching(true);
    try {
      const res = await API.get('/api/admin/broadcasts');
      setCampaignHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch broadcast history:', err);
    } finally {
      setHistoryFetching(false);
    }
  }, []);

  const handleBroadcastCampaign = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastError('Please fill out both Subject and Message fields.');
      return;
    }
    setBroadcastLoading(true);
    setBroadcastError('');
    setBroadcastSuccess('');
    try {
      const res = await API.post('/api/admin/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
      });
      setBroadcastSuccess(res.data?.message || 'Campaign successfully broadcasted to all active users!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchBroadcastHistory(); // refresh the history panel immediately
    } catch (err) {
      console.error('Failed to dispatch campaign:', err);
      setBroadcastError(err.response?.data?.error || 'Failed to dispatch broadcast marketing campaign.');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch functions
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await API.get('/api/admin/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      // Fetch products without page limit for admin panel
      const response = await API.get('/api/products', {
        params: { page: 0, size: 100 },
      });
      setProducts(response.data.content);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await API.get('/api/admin/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await API.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchBroadcastHistory();
  }, [fetchAnalytics, fetchProducts, fetchOrders, fetchUsers, fetchBroadcastHistory]);

  useEffect(() => {
    if (location.pathname === '/admin/users') {
      setActiveTab('users');
    }
  }, [location.pathname]);

  const handleUpdateUserRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      await API.put(`/api/admin/users/${userId}/role`, { role: newRole }, {
        params: { role: newRole }
      });
      alert('User role updated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const activeCategory = showNewCategoryField && newCategoryName.trim() !== '' 
        ? newCategoryName.trim() 
        : formData.category;

      // Automatically register new category into categoriesConfig
      if (activeCategory && !categoriesConfig.some(c => c.name.toLowerCase() === activeCategory.toLowerCase())) {
        const newCatObj = {
          id: Date.now(),
          name: activeCategory,
          image: newCategoryPhoto || formData.imageUrl || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80',
          active: true
        };
        saveCategoriesConfig([...categoriesConfig, newCatObj]);
      }

      await API.post('/api/products', {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stockQuantity: Math.floor(Number(formData.stockQuantity)),
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        category: activeCategory,
        rating: Number(formData.rating || 4.8),
      });

      setSuccessMsg('Product Added Successfully!');
      alert('Product Added Successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        imageUrl: '',
        category: '',
        rating: '4.8',
      });
      setNewCategoryName('');
      setNewCategoryPhoto('');
      setShowNewCategoryField(false);
      fetchProducts();
      fetchAnalytics();
      setActiveTab('catalog'); // Switch to catalog to see it
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this product?')) return;
    try {
      await API.delete(`/api/products/${productId}`);
      alert('Product Deleted Successfully!');
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleUpdateStock = async (productId, quantityChange) => {
    try {
      await API.patch(`/api/products/${productId}/stock`, { quantityChange });
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update stock quantity.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const activeCategory = showEditNewCategoryField && editNewCategoryName.trim() !== ''
        ? editNewCategoryName.trim()
        : editingProduct.category;

      // Automatically register new category into categoriesConfig
      if (activeCategory && !categoriesConfig.some(c => c.name.toLowerCase() === activeCategory.toLowerCase())) {
        const newCatObj = {
          id: Date.now(),
          name: activeCategory,
          image: editNewCategoryPhoto || editingProduct.imageUrl || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80',
          active: true
        };
        saveCategoriesConfig([...categoriesConfig, newCatObj]);
      }

      const payload = {
        ...editingProduct,
        category: activeCategory,
        rating: Number(editingProduct.rating || 4.8),
      };

      await API.put(`/api/products/${editingProduct.id}`, payload);
      alert('Product updated successfully!');
      setEditingProduct(null);
      setEditNewCategoryName('');
      setEditNewCategoryPhoto('');
      setShowEditNewCategoryField(false);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update product details.');
    }
  };

  const hasPlacedOrders = orders.some(o => (o.orderStatus || 'PLACED') === 'PLACED');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Navbar ────────────────────────────── */}
      <nav className="border-b border-border bg-surface-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-[#2A082D] border border-pink-800/40 rounded-xl flex items-center justify-center group-hover:bg-[#330D3A] transition-colors shadow-md">
                <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white font-serif">Back to Store</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-text-primary font-medium">{user?.username}</p>
                  <p className="text-text-muted text-xs">Admin Console</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg rounded-lg cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sub Navigation Tabs ───────────────── */}
      <div className="bg-[#330D3A] border-b border-pink-800/40 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-3 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Dashboard & Analytics' },
            { id: 'catalog', label: 'Manage Catalog' },
            { id: 'orders', label: 'Orders Fulfillment' },
            { id: 'reviews', label: '⭐ Reviews Moderation' },
            { id: 'add-product', label: 'Add New Product' },
            { id: 'users', label: 'User Roles (RBAC)' },
            { id: 'banner', label: '🖼️ Banner Engine' },
            { id: 'categories', label: '📂 Categories' },
            { id: 'sections', label: '⭐ Featured & Sections' },
            { id: 'marketing', label: 'Marketing & Announcements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs sm:text-sm font-bold flex items-center shrink-0 cursor-pointer transition-all relative rounded-lg px-3.5 py-2 ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:text-amber-300 hover:border-amber-400/30'
              }`}
            >
              {tab.label}
              {tab.id === 'orders' && hasPlacedOrders && (
                <span className="bg-red-500 rounded-full absolute -top-1 -right-1 w-3 h-3 animate-pulse border-2 border-slate-950" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dashboard Content ─────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: ANALYTICS & DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-slide-up">
            {/* Summary Widget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sales Card */}
              <div className="bg-[#330D3A] border border-pink-800/40 p-6 rounded-3xl flex items-center gap-5 shadow-xl text-white">
                <div className="w-14 h-14 bg-[#2A082D] border border-pink-800/40 text-amber-300 rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-pink-100/70 text-xs font-bold uppercase tracking-wider">Total Sales (Paid)</p>
                  <h3 className="text-3xl font-extrabold text-amber-300 mt-1">
                    ₹{Number(analytics.totalRevenue || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </div>

              {/* Orders count */}
              <div className="bg-[#330D3A] border border-pink-800/40 p-6 rounded-3xl flex items-center gap-5 shadow-xl text-white">
                <div className="w-14 h-14 bg-[#2A082D] border border-pink-800/40 text-amber-300 rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-pink-100/70 text-xs font-bold uppercase tracking-wider">Total Transactions</p>
                  <h3 className="text-3xl font-extrabold text-amber-300 mt-1">{analytics.totalOrders}</h3>
                </div>
              </div>

              {/* Low stock indicators */}
              <div className="bg-[#330D3A] border border-pink-800/40 p-6 rounded-3xl flex items-center gap-5 shadow-xl text-white">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                  analytics.lowStockProducts?.length > 0 ? 'bg-red-950/80 border border-red-500 text-red-300 animate-pulse' : 'bg-[#2A082D] border border-pink-800/40 text-amber-300'
                }`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-pink-100/70 text-xs font-bold uppercase tracking-wider">Low Stock Items</p>
                  <h3 className="text-3xl font-extrabold text-amber-300 mt-1">{analytics.lowStockProducts?.length || 0}</h3>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {analytics.lowStockProducts?.length > 0 && (
              <div className="bg-red-950/60 border border-red-500/50 rounded-3xl p-6 text-white">
                <h3 className="text-lg font-bold text-red-300 flex items-center gap-2 mb-4 font-serif">
                  ⚠️ Live Warehouse Re-Order Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.lowStockProducts.map((p) => (
                    <div key={p.id} className="bg-[#2A082D] border border-pink-800/40 rounded-2xl p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate text-sm">{p.name}</p>
                        <p className="text-pink-100/70 text-xs mt-0.5">Current Stock: <span className="text-red-300 font-extrabold">{p.stockQuantity}</span></p>
                      </div>
                      <button
                        onClick={() => handleUpdateStock(p.id, 10)}
                        className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border border-amber-400/30 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Quick Restock +10
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold text-white font-serif mb-4">Consolidated Operations Overview</h3>
              <p className="text-pink-100/80 leading-relaxed max-w-3xl text-sm">
                Welcome to the CreationHub Administration Engine. This dashboard allows real-time execution of product lifecycle parameters,
                warehouse catalog updates, transaction fulfillment tracking, and sales analytics. Use the tabs above to manage the live cluster.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CATALOG (ENTERPRISE EDITION WITH ORDER COUNTS & NAVIGATION) */}
        {activeTab === 'catalog' && (() => {
          // 1. Calculate Order Volume per product across all orders
          const productOrderCounts = {};
          orders.forEach(order => {
            if (Array.isArray(order.orderItems)) {
              order.orderItems.forEach(item => {
                const pid = item.product?.id || item.productId;
                if (pid) {
                  productOrderCounts[pid] = (productOrderCounts[pid] || 0) + (item.quantity || 1);
                }
              });
            }
          });

          // 2. Filter products by selected category and search query
          const filteredCatalogProducts = products.filter(p => {
            const categoryMatch = catalogSelectedCategory === 'All' || p.category === catalogSelectedCategory;
            const query = catalogSearchQuery.toLowerCase().trim();
            const nameMatch = p.name?.toLowerCase().includes(query);
            const descMatch = p.description?.toLowerCase().includes(query);
            const catMatch = p.category?.toLowerCase().includes(query);
            return categoryMatch && (nameMatch || descMatch || catMatch);
          });

          // 3. Compute Enterprise Inventory KPI metrics
          const totalProductsCount = products.length;
          const totalValuation = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stockQuantity || 0)), 0);
          const totalUnitsSold = Object.values(productOrderCounts).reduce((acc, count) => acc + count, 0);
          const lowStockCount = products.filter(p => Number(p.stockQuantity) < 5).length;

          // 4. Group filtered items by category
          const groups = {};
          filteredCatalogProducts.forEach(p => {
            const cat = p.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
          });

          const uniqueCategoriesList = getUniqueCategories();

          return (
            <div className="space-y-8 animate-slide-up text-white">
              {/* Top Enterprise Navigation Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-800/40 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white font-serif">Enterprise Warehouse Catalog Management</h2>
                  <p className="text-xs text-pink-100/70 mt-1">Real-time inventory control, order counts, stock thresholds & category analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-400/20 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    + Add New Product
                  </button>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-[#2A082D] border border-pink-800/40 hover:border-amber-400/50 rounded-xl text-xs font-extrabold text-amber-300 transition-all cursor-pointer shadow-md"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>

              {/* Enterprise KPI Summary Cards Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#330D3A] border border-pink-800/40 p-5 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Active Catalog</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-extrabold text-white font-serif">{totalProductsCount} Items</h3>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/20 px-2 py-0.5 rounded">Live</span>
                  </div>
                </div>

                <div className="bg-[#330D3A] border border-pink-800/40 p-5 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Inventory Valuation</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-extrabold text-amber-300 font-serif">₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                  </div>
                </div>

                <div className="bg-[#330D3A] border border-pink-800/40 p-5 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Lifetime Units Sold</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-extrabold text-emerald-300 font-serif">{totalUnitsSold} Units</h3>
                    <span className="text-[10px] text-amber-300 font-bold">🚀 Sales Volume</span>
                  </div>
                </div>

                <div className="bg-[#330D3A] border border-pink-800/40 p-5 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Low Stock Alerts (&lt; 5)</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className={`text-2xl font-extrabold font-serif ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {lowStockCount} Products
                    </h3>
                    {lowStockCount > 0 && <span className="text-[9px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">Action Req.</span>}
                  </div>
                </div>
              </div>

              {/* Interactive Category Pod Navigation Tabs */}
              <div className="bg-[#330D3A] border border-pink-800/40 p-4 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Quick Category Navigation</h4>
                  <span className="text-[11px] text-pink-100/60">Click pod to filter catalog</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  <button
                    onClick={() => setCatalogSelectedCategory('All')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      catalogSelectedCategory === 'All'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                        : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:border-amber-400/40'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="bg-[#330D3A] text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-mono">{products.length}</span>
                  </button>

                  {uniqueCategoriesList.map(cat => {
                    const catCount = products.filter(p => p.category === cat).length;
                    const isSel = catalogSelectedCategory === cat;
                    return (
                      <button
                        key={`cat-pod-${cat}`}
                        onClick={() => setCatalogSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                          isSel
                            ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                            : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:border-amber-400/40'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isSel ? 'bg-slate-950 text-amber-300' : 'bg-[#330D3A] text-pink-200'}`}>
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Search & Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#330D3A] border border-pink-800/40 p-4 rounded-2xl shadow-xl">
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    placeholder="Search product name, description or category..."
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs focus:border-amber-400 placeholder:text-pink-200/50 transition-all outline-none"
                  />
                  {catalogSearchQuery && (
                    <button onClick={() => setCatalogSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-rose-300 font-bold">Clear</button>
                  )}
                </div>

                <div className="text-xs text-pink-100/70 font-semibold">
                  Showing <span className="text-amber-300 font-bold">{filteredCatalogProducts.length}</span> of {products.length} Products
                </div>
              </div>

              {productsLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredCatalogProducts.length === 0 ? (
                <div className="bg-[#330D3A] border border-pink-800/40 p-12 text-center rounded-3xl space-y-3">
                  <p className="text-pink-100 text-base font-bold">No matching products found inside database.</p>
                  <button onClick={() => { setCatalogSelectedCategory('All'); setCatalogSearchQuery(''); }} className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
                    Reset Catalog Filters
                  </button>
                </div>
              ) : (
                <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl overflow-hidden shadow-2xl text-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-800/40 bg-[#2A082D] text-amber-300 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-center">Orders & Sales Count</th>
                          <th className="px-6 py-4 text-center">Stock Level</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-800/30 text-sm">
                        {Object.keys(groups).sort().map((catName) => (
                          <Fragment key={catName}>
                            {/* Structured Category divider header row block with item count badge */}
                            <tr className="bg-[#2A082D] border-y border-pink-800/40">
                              <td colSpan="6" className="px-6 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-extrabold tracking-widest text-amber-300 uppercase bg-amber-400/20 border border-amber-400/30 rounded-full px-3 py-1 shadow-sm">
                                    {catName}
                                  </span>
                                  <span className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">
                                    ({groups[catName].length} item{groups[catName].length > 1 ? 's' : ''})
                                  </span>
                                </div>
                              </td>
                            </tr>
                            
                            {groups[catName].map((p) => {
                              const orderCount = productOrderCounts[p.id] || 0;
                              const stockStatus = p.stockQuantity === 0 
                                ? { label: 'OUT OF STOCK', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
                                : p.stockQuantity < 5 
                                ? { label: 'LOW STOCK', style: 'bg-amber-400/20 text-amber-300 border-amber-400/40' }
                                : { label: 'IN STOCK', style: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40' };

                              return (
                                <tr key={p.id} className="hover:bg-[#2A082D]/50 transition-colors">
                                  <td className="px-6 py-4 text-amber-300 font-mono font-bold">#{p.id}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=80'}
                                        alt=""
                                        className="w-11 h-11 object-cover rounded-xl border border-pink-800/40 bg-[#2A082D] shrink-0"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=80'; }}
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-white truncate max-w-xs">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.2 rounded uppercase">
                                            {p.category || 'General'}
                                          </span>
                                          <p className="text-pink-100/70 text-xs truncate max-w-[200px]">{p.description || 'No description'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-amber-300 font-extrabold text-base">₹{Number(p.price).toFixed(2)}</td>

                                  {/* Enterprise Order Count Cell */}
                                  <td className="px-6 py-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${orderCount > 0 ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-[#2A082D] text-pink-100/60 border-pink-800/30'}`}>
                                        {orderCount > 0 ? `🚀 ${orderCount} Units Sold` : '0 Orders'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Stock Level & Status Badge Cell */}
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => handleUpdateStock(p.id, -1)}
                                          className="w-7 h-7 flex items-center justify-center bg-[#2A082D] border border-pink-800/40 hover:bg-[#330D3A] rounded-md font-bold text-amber-300 cursor-pointer active:scale-90"
                                        >
                                          -
                                        </button>
                                        <span className={`w-8 text-center font-extrabold ${p.stockQuantity < 5 ? 'text-rose-400' : 'text-white'}`}>
                                          {p.stockQuantity}
                                        </span>
                                        <button
                                          onClick={() => handleUpdateStock(p.id, 1)}
                                          className="w-7 h-7 flex items-center justify-center bg-[#2A082D] border border-pink-800/40 hover:bg-[#330D3A] rounded-md font-bold text-amber-300 cursor-pointer active:scale-90"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${stockStatus.style}`}>
                                        {stockStatus.label}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button
                                      onClick={() => setEditingProduct(p)}
                                      className="px-3.5 py-1.5 bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border border-amber-400/30 font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/30 font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: ORDERS FULFILLMENT */}
        {activeTab === 'orders' && (
          <OrdersFulfillmentTab orders={orders} ordersLoading={ordersLoading} fetchOrders={fetchOrders} handleUpdateOrderStatus={handleUpdateOrderStatus} />
        )}

        {/* TAB 3.5: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <AdminReviewsTab />
        )}

        {/* TAB 4: ADD NEW PRODUCT */}
        {activeTab === 'add-product' && (
          <div className="max-w-3xl mx-auto py-6 animate-slide-up">
            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
              <h3 className="text-xl font-bold text-white font-serif mb-6">Create New Catalog Product</h3>
              
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-950/80 border border-red-500 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-200 text-sm">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-emerald-200 text-sm">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Kundan Royal Necklace"
                    className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Select Category *</label>
                  {!showNewCategoryField ? (
                    <div className="space-y-2">
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white focus:border-amber-400 outline-none cursor-pointer font-bold text-sm"
                      >
                        <option value="">-- Choose Category --</option>
                        {getUniqueCategories().map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryField(true)}
                        className="text-xs font-extrabold text-amber-300 hover:underline cursor-pointer block mt-1"
                      >
                        + Add New Category
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-[#2A082D] border border-pink-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-300 uppercase">Type Custom Category Name & Photo</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryField(false);
                            setNewCategoryName('');
                            setNewCategoryPhoto('');
                          }}
                          className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category Name e.g. Bridal Jewellery"
                        className="w-full px-4 py-2.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white focus:border-amber-400 outline-none text-xs font-bold"
                      />

                      {/* Photo Upload Options for New Category */}
                      <div className="space-y-2 pt-1">
                        <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Category Circle Photo (Gallery, Camera, or Image URL)
                        </label>
                        {newCategoryPhoto ? (
                          <div className="flex items-center gap-3 bg-[#330D3A] p-2 rounded-xl border border-pink-800/40">
                            <img src={newCategoryPhoto} alt="Preview" className="w-8 h-8 object-cover rounded-full border border-amber-400/40" />
                            <span className="text-[10px] text-white truncate flex-1 font-mono">{newCategoryPhoto.substring(0, 25)}...</span>
                            <button type="button" onClick={() => setNewCategoryPhoto('')} className="text-[9px] text-rose-300 font-bold px-2 py-0.5 bg-rose-500/20 rounded">Remove</button>
                          </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Gallery</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (res) => setNewCategoryPhoto(res))} className="hidden" />
                          </label>

                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Camera</span>
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageFileUpload(e, (res) => setNewCategoryPhoto(res))} className="hidden" />
                          </label>
                        </div>

                        <input
                          type="text"
                          value={newCategoryPhoto}
                          onChange={(e) => setNewCategoryPhoto(e.target.value)}
                          placeholder="Or paste category image URL..."
                          className="w-full px-3 py-2 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe product details..."
                    className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none transition-all resize-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Price (INR) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-amber-300 font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="299.99"
                        className="w-full pl-8 pr-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      value={formData.stockQuantity}
                      onChange={handleFormChange}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">⭐ Base Rating (1.0 - 5.0) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      name="rating"
                      required
                      value={formData.rating}
                      onChange={handleFormChange}
                      placeholder="4.8"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-amber-300 font-extrabold text-base outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Product Photo Upload: Camera, Gallery & Web Link */}
                <div className="space-y-3 bg-[#2A082D] border border-pink-800/50 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Product Photo (Gallery, Camera, or URL) *
                  </label>

                  {/* Live Image Preview if present */}
                  {formData.imageUrl ? (
                    <div className="flex items-center gap-4 bg-[#330D3A] p-3 rounded-xl border border-pink-800/40">
                      <img
                        src={formData.imageUrl}
                        alt="Product Preview"
                        className="w-20 h-20 object-cover rounded-xl border border-amber-400/30 shadow-md shrink-0 bg-[#2A082D]"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white font-serif">Selected Product Image ✓</p>
                        <p className="text-[10px] text-pink-100/70 truncate mt-0.5 font-mono">
                          {formData.imageUrl.startsWith('data:') ? 'Captured Base64 Image File' : formData.imageUrl}
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="mt-2 text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Upload Action Buttons: Gallery & Camera */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Gallery Button */}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                      <Upload className="w-4 h-4 text-amber-300" />
                      <span>Upload from Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, (res) => setFormData(prev => ({ ...prev, imageUrl: res })))}
                        className="hidden"
                      />
                    </label>

                    {/* Camera Button */}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>Take Photo with Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageFileUpload(e, (res) => setFormData(prev => ({ ...prev, imageUrl: res })))}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Fallback Direct URL Input */}
                  <div className="pt-1">
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleFormChange}
                      placeholder="Or paste external image URL (e.g. https://...)"
                      className="w-full px-4 py-2.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-400/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: USER ROLE MANAGEMENT (RBAC) */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Enterprise Role-Based Access Control (RBAC)</h2>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-surface-input border border-border hover:border-primary/50 rounded-xl text-xs font-semibold text-text-primary transition-all cursor-pointer"
              >
                Refresh Users
              </button>
            </div>

            {usersLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="bg-surface-card border border-border p-12 text-center rounded-2xl">
                <p className="text-text-secondary text-base">No registered users found inside database.</p>
              </div>
            ) : (
              <div className="bg-[#330D3A] border border-pink-800/40 rounded-2xl overflow-hidden shadow-xl text-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-pink-800/40 bg-[#2A082D] text-amber-300 text-xs uppercase font-bold tracking-wider">
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4 text-right">Administrative Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-800/30 text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#2A082D]/50 transition-colors">
                          <td className="px-6 py-4 text-amber-300 font-mono font-bold">#{u.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white">{u.username}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleViewUserHistory(u)}
                                className="px-3.5 py-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:bg-amber-400/35 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
                              >
                                View History
                              </button>
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-pink-800/50 bg-[#2A082D] text-white cursor-pointer transition-colors focus:border-amber-400 ${
                                  u.role === 'ROLE_ADMIN'
                                    ? 'text-amber-300 border-amber-400/40 bg-amber-400/20'
                                    : 'text-white border-pink-800/50 bg-[#2A082D]'
                                }`}
                              >
                                <option value="ROLE_USER">USER</option>
                                <option value="ROLE_ADMIN">ADMIN</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MARKETING & ANNOUNCEMENTS — Dual Panel Layout */}
        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Admin Broadcast Marketing Console</h2>
                <p className="text-xs text-text-secondary mt-1">Create campaigns and review full dispatch history in real-time.</p>
              </div>
              <button
                onClick={fetchBroadcastHistory}
                className="px-4 py-2 bg-surface-input border border-border hover:border-primary/50 rounded-xl text-xs font-semibold text-text-secondary transition-all cursor-pointer"
              >
                ↻ Refresh History
              </button>
            </div>

            {/* ── Dual Panel Grid ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

              {/* LEFT PANEL — Composer */}
              <div className="lg:col-span-3 bg-[#330D3A] border border-pink-800/40 p-6 sm:p-8 rounded-3xl shadow-xl text-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#2A082D] border border-pink-800/40 flex items-center justify-center text-amber-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">Create System-wide Broadcast</h3>
                    <p className="text-[11px] text-pink-100/70">Emails all active registered users asynchronously.</p>
                  </div>
                </div>

                {/* Inline Success Banner */}
                <AnimatePresence>
                  {broadcastSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-200"
                    >
                      <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {broadcastSuccess}
                      <button onClick={() => setBroadcastSuccess('')} className="ml-auto text-emerald-300 hover:text-white cursor-pointer">✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Inline Error Banner */}
                <AnimatePresence>
                  {broadcastError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 p-3 bg-red-950/80 border border-red-500 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-200"
                    >
                      <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {broadcastError}
                      <button onClick={() => setBroadcastError('')} className="ml-auto text-red-300 hover:text-white cursor-pointer">✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleBroadcastCampaign} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Campaign Subject / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exclusive Royal Wedding Sale: 25% Off Kundan Sets!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Campaign Message Body</label>
                    <textarea
                      required
                      rows={7}
                      placeholder="Provide detailed campaign body text or promotional announcement..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-400/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    {broadcastLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        Broadcasting to all users...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Broadcast Campaign Live
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT PANEL — Campaign History */}
              <div className="lg:col-span-2 bg-[#330D3A] border border-pink-800/40 rounded-3xl shadow-xl flex flex-col overflow-hidden text-white" style={{ minHeight: '520px' }}>
                <div className="p-5 border-b border-pink-800/30 flex items-center justify-between bg-[#2A082D]">
                  <div>
                    <h3 className="text-sm font-bold text-white font-serif">Broadcast History</h3>
                    <p className="text-[11px] text-pink-100/70 mt-0.5">{campaignHistory.length} campaign{campaignHistory.length !== 1 ? 's' : ''} dispatched</p>
                  </div>
                  {historyFetching && (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
                  {campaignHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#2A082D] border border-pink-800/40 flex items-center justify-center mb-4 text-amber-300">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-white font-serif">No campaigns yet</p>
                      <p className="text-xs text-pink-100/70 mt-1 max-w-[160px] leading-relaxed">Fire your first broadcast from the composer on the left.</p>
                    </div>
                  ) : (
                    campaignHistory.map((campaign) => (
                      <motion.div
                        key={campaign.id}
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCampaign(campaign)}
                        className="p-4 bg-[#2A082D] border border-pink-800/40 hover:border-amber-400/50 rounded-2xl cursor-pointer transition-all group"
                      >
                        {/* Campaign Subject */}
                        <p className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                          {campaign.title}
                        </p>
                        {/* Sent At */}
                        <p className="text-[11px] text-pink-100/70 mt-1.5 font-medium">
                          {new Date(campaign.sentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        {/* Recipients Pill */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded-full text-[10px] font-bold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {campaign.recipientCount} Recipients
                          </span>
                          <span className="text-[10px] text-pink-100/70 font-medium">Click to expand →</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CAMPAIGN DETAIL MODAL ────────────────────────────────── */}
        <AnimatePresence>
          {selectedCampaign && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => setSelectedCampaign(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#330D3A] rounded-3xl shadow-2xl border border-pink-800/40 w-full max-w-xl overflow-hidden text-white"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-pink-800/30 bg-[#2A082D] flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Campaign #{selectedCampaign.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-serif leading-tight">{selectedCampaign.title}</h3>
                    <p className="text-xs text-pink-100/70 mt-1 font-medium">
                      Dispatched on {new Date(selectedCampaign.sentAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="w-8 h-8 rounded-full bg-[#330D3A] hover:bg-[#2A082D] flex items-center justify-center text-amber-300 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5 border border-pink-800/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Message Body */}
                  <div>
                    <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-2">Campaign Message</p>
                    <div className="p-4 bg-[#2A082D] border border-pink-800/40 rounded-2xl text-sm text-white leading-relaxed whitespace-pre-line">
                      {selectedCampaign.content}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#2A082D] border border-pink-800/40 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">Recipients</p>
                      <p className="text-2xl font-extrabold text-amber-300 mt-0.5">{selectedCampaign.recipientCount}</p>
                    </div>
                    <div className="p-3 bg-[#2A082D] border border-pink-800/40 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Status</p>
                      <p className="text-sm font-extrabold text-emerald-300 mt-1">DISPATCHED ✓</p>
                    </div>
                  </div>

                  {/* Recipient Email Tags */}
                  {selectedCampaign.recipients && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-3">Target Mailboxes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCampaign.recipients.split(',').filter(Boolean).map((email, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A082D] border border-pink-800/40 text-white rounded-full text-[11px] font-semibold shadow-sm"
                          >
                            <svg className="w-3 h-3 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            {email.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-pink-800/30 bg-[#2A082D] flex justify-end">
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl cursor-pointer transition-colors uppercase tracking-wider shadow-md"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB: BANNER ENGINE (Hero Text + Multi-Photo Auto Carousel) ── */}
        {activeTab === 'banner' && (
          <div className="space-y-8 animate-slide-up text-white">
            <div className="flex items-center justify-between border-b border-pink-800/40 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white font-serif">🖼️ Home Screen Banner Engine</h2>
                <p className="text-xs text-pink-100/70 mt-1">
                  Customize the Hero banner copy, call-to-action buttons, and manage 1 to 10+ slide photos with auto-carousel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Form: Text Content Customizer */}
              <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
                <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                  1. Hero Banner Text Content
                </h3>

                <form onSubmit={(e) => { e.preventDefault(); saveBannerConfig(bannerConfig); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                      Top Badge Text
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.badgeText || ''}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, badgeText: e.target.value })}
                      placeholder="e.g. ROYAL BRIDAL COUTURE COLLECTION"
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                      Main Heading Line 1
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.headingLine1 || ''}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, headingLine1: e.target.value })}
                      placeholder="e.g. Elevate Your Wedding Day"
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-serif font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                      Main Heading Line 2 (Italic Accent)
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.headingLine2 || ''}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, headingLine2: e.target.value })}
                      placeholder="e.g. Bridal Grace & Glamour"
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-amber-300 font-serif italic font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                      Sub-description Text
                    </label>
                    <textarea
                      rows={3}
                      value={bannerConfig.descriptionText || ''}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, descriptionText: e.target.value })}
                      placeholder="e.g. Discover handcrafted golden Kaleeras, traditional Punjabi Choodas..."
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                      Action Button Label
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.buttonText || ''}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, buttonText: e.target.value })}
                      placeholder="e.g. EXPLORE BRIDAL COLLECTIONS"
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-amber-300 font-extrabold text-xs outline-none focus:border-amber-400 uppercase tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl uppercase tracking-wider shadow-lg shadow-amber-400/25 cursor-pointer text-xs transition-all active:scale-98"
                  >
                    Save Banner Text Copy
                  </button>
                </form>
              </div>

              {/* Right Form: Live Preview & Multi-Photo Carousel Manager */}
              <div className="space-y-6">
                {/* Live Preview Box */}
                <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 shadow-2xl space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-widest">Live Hero Text Preview</h4>
                  <div className="bg-[#2A082D] border border-pink-800/40 p-5 rounded-2xl space-y-2">
                    <span className="text-[9px] font-bold text-amber-300 tracking-widest uppercase bg-[#330D3A] px-2.5 py-1 rounded-full border border-pink-800/40 inline-block">
                      ✦ {bannerConfig.badgeText || "ROYAL BRIDAL COUTURE COLLECTION"}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white leading-tight">
                      {bannerConfig.headingLine1 || "Elevate Your Wedding Day"} <br />
                      <span className="italic text-amber-300">{bannerConfig.headingLine2 || "Bridal Grace & Glamour"}</span>
                    </h3>
                    <p className="text-[11px] text-pink-100/70 line-clamp-2">{bannerConfig.descriptionText}</p>
                    <div className="pt-2">
                      <span className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block">
                        {bannerConfig.buttonText || "EXPLORE BRIDAL COLLECTIONS"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Slide Form */}
                <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
                  <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                    2. Add Banner Carousel Slide Photo (1 to 10+)
                  </h3>

                  <form onSubmit={handleAddSlide} className="space-y-4">
                    {/* Photo Upload Options */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider">
                        Slide Photo (Gallery, Camera or URL)
                      </label>

                      {newSlide.image ? (
                        <div className="flex items-center gap-3 bg-[#2A082D] p-2 rounded-xl border border-pink-800/40">
                          <img src={newSlide.image} alt="Slide Preview" className="w-12 h-12 object-cover rounded-lg border border-amber-400/40" />
                          <span className="text-xs text-white truncate flex-1 font-mono">{newSlide.image.substring(0, 30)}...</span>
                          <button type="button" onClick={() => setNewSlide({ ...newSlide, image: '' })} className="text-xs text-rose-300 font-bold px-2 py-1 bg-rose-500/20 rounded-lg">Remove</button>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2A082D] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Gallery</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (res) => setNewSlide(prev => ({ ...prev, image: res })))} className="hidden" />
                        </label>
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2A082D] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Camera</span>
                          <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageFileUpload(e, (res) => setNewSlide(prev => ({ ...prev, image: res })))} className="hidden" />
                        </label>
                      </div>

                      <input
                        type="text"
                        value={newSlide.image}
                        onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                        placeholder="Or paste external image URL..."
                        className="w-full px-3.5 py-2 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 text-xs outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-pink-100/80 uppercase">Sub-label</label>
                        <input
                          type="text"
                          value={newSlide.label}
                          onChange={(e) => setNewSlide({ ...newSlide, label: e.target.value })}
                          placeholder="e.g. Traditional Elegance"
                          className="w-full px-3 py-2 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-pink-100/80 uppercase">Title</label>
                        <input
                          type="text"
                          value={newSlide.title}
                          onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                          placeholder="e.g. Punjabi Designer Choodas"
                          className="w-full px-3 py-2 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#2A082D] hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-extrabold border border-amber-400/50 rounded-xl uppercase tracking-wider text-xs transition-all cursor-pointer"
                    >
                      + Add Slide Photo to Carousel
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Active Slides Manager */}
            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-pink-800/30 pb-3">
                <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                  Active Carousel Slide Photos ({bannerConfig.slides.length})
                </h3>
                <span className="text-xs text-pink-100/70">Auto-rotates on Home Page (4.5s)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bannerConfig.slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="bg-[#2A082D] border border-pink-800/40 rounded-2xl overflow-hidden p-3 space-y-2 relative shadow-md">
                    <img src={slide.image} alt={slide.title} className="w-full h-36 object-cover rounded-xl border border-pink-800/30" />
                    <div>
                      <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">{slide.label || 'Collection'}</span>
                      <h4 className="text-xs font-bold text-white font-serif truncate">{slide.title || 'Slide Title'}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="w-full py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-500/30"
                    >
                      Delete Slide
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: CATEGORIES MANAGER (Add, Edit, Delete, General Fallback) ── */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-slide-up text-white">
            <div className="flex items-center justify-between border-b border-pink-800/40 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white font-serif">📂 Dynamic Category Manager</h2>
                <p className="text-xs text-pink-100/70 mt-1">
                  Manage store category circles, icons, and photos. Deleting a category safely re-assigns its products to "General".
                </p>
              </div>
            </div>

            {/* Add New Category Form */}
            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                Add New Category
              </h3>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1.5">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addCatForm.name}
                      onChange={(e) => setAddCatForm({ ...addCatForm, name: e.target.value })}
                      placeholder="e.g. Necklaces, Jhumkas, Payal"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Photo Upload Options */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1.5">
                      Category Photo (Gallery, Camera, or Image URL)
                    </label>

                    {addCatForm.image ? (
                      <div className="flex items-center gap-3 bg-[#2A082D] p-2.5 rounded-xl border border-pink-800/40">
                        <img src={addCatForm.image} alt="Preview" className="w-9 h-9 object-cover rounded-full border border-amber-400/40" />
                        <span className="text-xs text-white truncate flex-1 font-mono">{addCatForm.image.substring(0, 30)}...</span>
                        <button type="button" onClick={() => setAddCatForm({ ...addCatForm, image: '' })} className="text-[10px] text-rose-300 font-bold px-2 py-1 bg-rose-500/20 rounded-lg">Remove</button>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2A082D] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Gallery</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (res) => setAddCatForm(prev => ({ ...prev, image: res })))} className="hidden" />
                      </label>

                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2A082D] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageFileUpload(e, (res) => setAddCatForm(prev => ({ ...prev, image: res })))} className="hidden" />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={addCatForm.image}
                      onChange={(e) => setAddCatForm({ ...addCatForm, image: e.target.value })}
                      placeholder="Or paste category image URL..."
                      className="w-full px-3.5 py-2 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl uppercase tracking-wider shadow-lg shadow-amber-400/25 cursor-pointer text-xs transition-all active:scale-98"
                >
                  + Add New Category
                </button>
              </form>
            </div>

            {/* Categories List Cards Grid */}
            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                Store Categories ({categoriesConfig.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoriesConfig.map((cat) => {
                  const catProductsCount = products.filter(p => p.category === cat.name).length;
                  return (
                    <div key={cat.id} className="bg-[#2A082D] border border-pink-800/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 relative shadow-lg hover:border-amber-400/40 transition-all">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80'}
                        alt={cat.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80';
                        }}
                        className="w-20 h-20 object-cover rounded-full border-2 border-amber-400/50 shadow-md bg-[#330D3A]"
                      />

                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white font-serif">{cat.name}</h4>
                        <span className="text-[10px] text-pink-100/70 font-semibold uppercase tracking-wider block">
                          {catProductsCount} Products Assigned
                        </span>
                      </div>

                      <div className="flex gap-2 w-full pt-2 border-t border-pink-800/30">
                        <button
                          onClick={() => setEditingCategory({ id: cat.id, name: cat.name, originalName: cat.name, image: cat.image || '' })}
                          className="flex-1 py-1.5 bg-[#330D3A] hover:bg-amber-400 hover:text-slate-950 text-amber-300 rounded-lg text-xs font-bold border border-pink-800/40 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: FEATURED PRODUCTS & CUSTOM SECTIONS ENGINE ── */}
        {activeTab === 'sections' && (
          <div className="space-y-8 animate-slide-up text-white">
            <div className="flex items-center justify-between border-b border-pink-800/40 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white font-serif">⭐ Featured Showcase & Custom Sections Engine</h2>
                <p className="text-xs text-pink-100/70 mt-1">
                  Create custom sections (e.g. Featured Luxury Collections, Hot Deals, New Arrivals), set Section Priority, and assign Product Priorities.
                </p>
              </div>
            </div>

            {/* Create Custom Section Form */}
            <div className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <h3 className="text-base font-extrabold text-amber-300 font-serif uppercase tracking-wider">
                Create New Showcase Section
              </h3>

              <form onSubmit={handleAddSectionSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newSectionForm.name}
                    onChange={(e) => setNewSectionForm({ ...newSectionForm, name: e.target.value })}
                    placeholder="e.g. ⭐ Featured Luxury Collections, Hot Deals"
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-100/80 uppercase tracking-wider mb-1">
                    Section Priority Order (1 = Top)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSectionForm.priority}
                    onChange={(e) => setNewSectionForm({ ...newSectionForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-amber-300 font-bold text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl uppercase tracking-wider shadow-lg shadow-amber-400/25 cursor-pointer text-xs transition-all active:scale-98"
                >
                  + Create Showcase Section
                </button>
              </form>
            </div>

            {/* Showcase Sections List & Product Priority Managers */}
            <div className="space-y-6">
              {sectionsConfig
                .sort((a, b) => (a.priority || 99) - (b.priority || 99))
                .map((sec) => (
                  <div key={sec.id} className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-pink-800/30 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs">
                          Priority #{sec.priority || 1}
                        </span>
                        <h3 className="text-lg font-bold text-white font-serif">{sec.name}</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleSectionActive(sec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            sec.active
                              ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {sec.active ? 'ACTIVE ON HOME ✓' : 'HIDDEN'}
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Delete Section
                        </button>
                      </div>
                    </div>

                    {/* Product Priority Table inside section */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                        Assign & Set Product Priority Order (1 = Top First Product)
                      </h4>

                      <div className="overflow-x-auto rounded-2xl border border-pink-800/40 bg-[#2A082D]">
                        <table className="w-full text-left text-xs text-white">
                          <thead className="bg-[#330D3A] text-pink-100/70 uppercase text-[10px] font-bold border-b border-pink-800/40">
                            <tr>
                              <th className="px-4 py-3">Product</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Price</th>
                              <th className="px-4 py-3 text-right">Product Priority (0 = Excluded, 1 = Top)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-pink-800/20">
                            {products.map((p) => {
                              const currentPrio = sec.productPriorities?.[p.id] || 0;
                              return (
                                <tr key={`sec-${sec.id}-prod-${p.id}`} className="hover:bg-[#330D3A]/50 transition-colors">
                                  <td className="px-4 py-3 font-semibold flex items-center gap-3">
                                    <img src={p.imageUrl} alt="" className="w-8 h-8 object-cover rounded-lg border border-pink-800/40" />
                                    <span>{p.name}</span>
                                  </td>
                                  <td className="px-4 py-3 text-pink-100/70">{p.category || 'General'}</td>
                                  <td className="px-4 py-3 text-amber-300 font-bold">₹{p.price}</td>
                                  <td className="px-4 py-3 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentPrio || ''}
                                      placeholder="0 (Off)"
                                      onChange={(e) => handleSetProductPriorityInSection(sec.id, p.id, Number(e.target.value))}
                                      className="w-20 px-3 py-1.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-amber-300 text-center font-extrabold outline-none focus:border-amber-400"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* ── EDIT CATEGORY MODAL DIALOG ─────────── */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#330D3A] border border-pink-800/40 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-pink-800/30 pb-4">
              <h3 className="text-lg font-bold text-white font-serif">Edit Category Details</h3>
              <button onClick={() => setEditingCategory(null)} className="text-amber-300 hover:text-white cursor-pointer p-1 rounded-full hover:bg-[#2A082D]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-sm outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Photo Upload */}
              <div className="space-y-3 bg-[#2A082D] border border-pink-800/50 p-4 rounded-2xl">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Category Photo (Gallery, Camera, or Image URL)
                </label>

                {editingCategory.image ? (
                  <div className="flex items-center gap-3 bg-[#330D3A] p-2.5 rounded-xl border border-pink-800/40">
                    <img
                      src={editingCategory.image}
                      alt="Category Preview"
                      className="w-12 h-12 object-cover rounded-full border border-amber-400/40 shadow-md bg-[#2A082D]"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=200&q=80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white font-serif">Current Photo ✓</p>
                      <p className="text-[10px] text-pink-100/70 truncate mt-0.5 font-mono">{editingCategory.image}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, image: '' })}
                      className="text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/20 border border-rose-500/30 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, (res) => setEditingCategory(prev => ({ ...prev, image: res })))}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageFileUpload(e, (res) => setEditingCategory(prev => ({ ...prev, image: res })))}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={editingCategory.image || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  placeholder="Or paste external image URL..."
                  className="w-full px-3.5 py-2.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 text-xs focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-pink-800/30">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-[#2A082D] text-pink-100/80 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT MODAL DIALOG (ENTERPRISE SPACIOUS FULL-SCREEN VIEW) ──────────── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#330D3A] border border-pink-800/50 w-full max-w-5xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white my-auto relative">
            <div className="flex items-center justify-between border-b border-pink-800/40 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white font-serif">✏️ Edit Product Parameters</h3>
                <p className="text-xs text-pink-100/70 mt-0.5">Product ID #{editingProduct.id} • Live Catalog Update</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-amber-300 hover:text-white cursor-pointer p-2 rounded-full hover:bg-[#2A082D] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Text & Price Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="e.g. Kundan Royal Choker Set"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">Product Category *</label>
                    {!showEditNewCategoryField ? (
                      <div className="space-y-1.5">
                        <select
                          required
                          value={editingProduct.category || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white cursor-pointer focus:border-amber-400 transition-all font-bold text-sm outline-none"
                        >
                          <option value="">-- Select Category --</option>
                          {getUniqueCategories().map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowEditNewCategoryField(true)}
                          className="text-xs font-extrabold text-amber-300 hover:underline cursor-pointer block mt-1"
                        >
                          + Add New Category
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-[#2A082D] border border-pink-800/50 p-3.5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-amber-300 uppercase">Type Custom Category Name</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditNewCategoryField(false);
                              setEditNewCategoryName('');
                            }}
                            className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={editNewCategoryName}
                          onChange={(e) => setEditNewCategoryName(e.target.value)}
                          placeholder="e.g. Bridal Jewellery"
                          className="w-full px-3 py-2 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white focus:border-amber-400 outline-none text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">Product Description</label>
                    <textarea
                      rows={5}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Enter detailed product specifications..."
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white resize-none text-xs outline-none focus:border-amber-400 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">Price (INR ₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-extrabold text-base outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stockQuantity}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Math.floor(Number(e.target.value)) })}
                        className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-extrabold text-base outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">⭐ Base Rating (1.0 - 5.0) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="5.0"
                        required
                        value={editingProduct.rating || 4.8}
                        onChange={(e) => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-xl text-amber-300 font-extrabold text-base outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Photo Upload & Large Preview */}
                <div className="space-y-5 flex flex-col justify-between">
                  <div className="space-y-4 bg-[#2A082D] border border-pink-800/50 p-5 rounded-2xl flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Product Photo (Gallery, Camera, or Image URL) *
                    </label>

                    {/* Large Preview Box */}
                    <div className="flex-1 min-h-[220px] bg-[#330D3A] border border-pink-800/40 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      {editingProduct.imageUrl ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
                          <img
                            src={editingProduct.imageUrl}
                            alt="Product Preview"
                            className="max-h-48 w-auto object-contain rounded-xl border-2 border-amber-400/40 shadow-lg bg-[#2A082D]"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                          />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                            className="text-xs font-bold text-rose-300 hover:text-white bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2 p-6">
                          <Upload className="w-10 h-10 text-amber-300 mx-auto opacity-70" />
                          <p className="text-xs text-pink-100/70 font-semibold">No Image Selected</p>
                          <p className="text-[10px] text-pink-200/50">Upload from gallery, camera, or paste URL below</p>
                        </div>
                      )}
                    </div>

                    {/* Gallery & Camera Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                        <Upload className="w-4 h-4 text-amber-300" />
                        <span>Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, (res) => setEditingProduct(prev => ({ ...prev, imageUrl: res })))}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleImageFileUpload(e, (res) => setEditingProduct(prev => ({ ...prev, imageUrl: res })))}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={editingProduct.imageUrl || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      placeholder="Or paste external image URL..."
                      className="w-full px-3.5 py-2.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer Strip */}
              <div className="flex gap-4 justify-end pt-6 border-t border-pink-800/40">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 bg-[#2A082D] hover:bg-slate-900 text-pink-100/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-pink-800/40 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Customer Purchase History Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <div 
            onClick={() => setSelectedUserForHistory(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Content */}
          <div className="bg-[#330D3A] rounded-3xl border border-pink-800/40 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden z-10 flex flex-col text-white">
            
            {/* Header */}
            <div className="p-6 border-b border-pink-800/30 flex items-center justify-between bg-[#2A082D]">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">Customer Purchase History</h3>
                <p className="text-xs text-pink-100/70 mt-1">Viewing order trail for <span className="font-bold text-amber-300">@{selectedUserForHistory.username}</span> ({selectedUserForHistory.email})</p>
              </div>
              <button 
                onClick={() => setSelectedUserForHistory(null)}
                className="p-2 rounded-full hover:bg-[#330D3A] text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6 max-h-[60vh]">
              {historyLoading ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-pink-100/70 mt-3 font-semibold tracking-wide uppercase">Retrieving Order Logs...</p>
                </div>
              ) : userHistory.length === 0 ? (
                <div className="text-center py-16 bg-[#2A082D] rounded-2xl border border-pink-800/40 p-8">
                  <svg className="w-12 h-12 text-amber-300/40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <p className="text-sm font-bold text-white font-serif">No Orders Placed Yet</p>
                  <p className="text-xs text-pink-100/70 mt-1 max-w-xs mx-auto">This customer account has not initialized any online purchases on the storefront.</p>
                </div>
              ) : (
                <>
                  {/* Top Metrics Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#2A082D] border border-pink-800/40 rounded-2xl">
                      <p className="text-xs font-semibold text-pink-100/70 uppercase tracking-wider">Total Orders Placed</p>
                      <p className="text-2xl font-extrabold text-amber-300 mt-1">{userHistory.length}</p>
                    </div>
                    <div className="p-4 bg-[#2A082D] border border-pink-800/40 rounded-2xl">
                      <p className="text-xs font-semibold text-pink-100/70 uppercase tracking-wider">Lifetime Value (LTV)</p>
                      <p className="text-2xl font-extrabold text-amber-300 mt-1">
                        ₹{userHistory.reduce((sum, o) => sum + (o.totalOrderCost || 0), 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Vertical History Stream */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Historical Order Stream</h4>
                    <div className="space-y-3">
                      {userHistory.map((o) => (
                        <div key={o.orderId} className="p-4 border border-pink-800/40 bg-[#2A082D] rounded-2xl shadow-md space-y-3">
                          
                          {/* Top Row: Order ID & Date */}
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded">#{o.orderId}</span>
                              <span className="text-[11px] text-pink-100/70 ml-2 font-medium">{new Date(o.executionTimestamp).toLocaleString()}</span>
                            </div>
                            <span className="text-sm font-extrabold text-amber-300">
                              ₹{Number(o.totalOrderCost).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </div>

                          {/* Middle Row: Products */}
                          <div className="p-3 bg-[#330D3A] border border-pink-800/30 rounded-xl">
                            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">Purchased Products</p>
                            <p className="text-xs text-white font-semibold leading-relaxed">
                              {o.productNames && o.productNames.length > 0 
                                ? o.productNames.join(', ') 
                                : 'No products found'}
                            </p>
                          </div>

                          {/* Bottom Row: Status Badges */}
                          <div className="flex gap-2">
                            {/* Payment Badge */}
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            }`}>
                              PAYMENT: {o.paymentStatus || 'PENDING'}
                            </span>
                            {/* Fulfillment Status Badge */}
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              o.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                : o.orderStatus === 'SHIPPED'
                                ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
                                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            }`}>
                              DELIVERY: {o.orderStatus || 'PLACED'}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
