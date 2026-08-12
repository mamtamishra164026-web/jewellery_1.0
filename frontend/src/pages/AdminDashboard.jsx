import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Trash2 } from 'lucide-react';
import OrdersFulfillmentTab from '../components/OrdersFulfillmentTab';
import API from '../services/api';

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
    if (location.state?.activeTab === 'orders') {
      setActiveTab('orders');
    }
  }, [location.state]);

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
  });

  const DEFAULT_CATEGORIES = ['Kaleera', 'Chooda', 'Bridal Jewellery', 'Hair Accessories'];

  const getUniqueCategories = () => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach(p => {
      if (p.category && p.category.trim() !== '') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  };

  const [showNewCategoryField, setShowNewCategoryField] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [showEditNewCategoryField, setShowEditNewCategoryField] = useState(false);
  const [editNewCategoryName, setEditNewCategoryName] = useState('');

  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSelectedCategory, setCatalogSelectedCategory] = useState('All');

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

      await API.post('/api/products', {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stockQuantity: Math.floor(Number(formData.stockQuantity)),
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        category: activeCategory,
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
      });
      setNewCategoryName('');
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

      const payload = {
        ...editingProduct,
        category: activeCategory,
      };

      await API.put(`/api/products/${editingProduct.id}`, payload);
      alert('Product updated successfully!');
      setEditingProduct(null);
      setEditNewCategoryName('');
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
              <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-lg font-bold text-text-primary">Back to Store</span>
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
            { id: 'add-product', label: 'Add New Product' },
            { id: 'users', label: 'User Roles (RBAC)' },
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

        {/* TAB 2: MANAGE CATALOG */}
        {activeTab === 'catalog' && (() => {
          const filteredCatalogProducts = products.filter(p => {
            const categoryMatch = catalogSelectedCategory === 'All' || p.category === catalogSelectedCategory;
            const query = catalogSearchQuery.toLowerCase().trim();
            const nameMatch = p.name?.toLowerCase().includes(query);
            const descMatch = p.description?.toLowerCase().includes(query);
            const catMatch = p.category?.toLowerCase().includes(query);
            return categoryMatch && (nameMatch || descMatch || catMatch);
          });

          const groups = {};
          filteredCatalogProducts.forEach(p => {
            const cat = p.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
          });

          return (
            <div className="space-y-6 animate-slide-up text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-serif">Warehouse Catalog Management</h2>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-[#2A082D] border border-pink-800/40 hover:border-amber-400/50 rounded-xl text-xs font-extrabold text-amber-300 transition-all cursor-pointer shadow-md"
                >
                  Refresh Data
                </button>
              </div>

              {/* Dynamic Filter and Search Control Row */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#330D3A] border border-pink-800/40 p-4 rounded-2xl shadow-xl">
                <div className="w-full sm:w-64">
                  <select
                    value={catalogSelectedCategory}
                    onChange={(e) => setCatalogSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs font-bold cursor-pointer focus:border-amber-400 transition-all outline-none"
                  >
                    <option value="All">All Categories</option>
                    {getUniqueCategories().map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search product name or category..."
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white text-xs focus:border-amber-400 placeholder:text-pink-200/50 transition-all outline-none"
                  />
                </div>
              </div>

              {productsLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredCatalogProducts.length === 0 ? (
                <div className="bg-surface-card border border-border p-12 text-center rounded-2xl">
                  <p className="text-text-secondary text-base">No matching products found inside database.</p>
                </div>
              ) : (
                <div className="bg-[#330D3A] border border-pink-800/40 rounded-2xl overflow-hidden shadow-xl text-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-800/40 bg-[#2A082D] text-amber-300 text-xs uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-center">Stock Level</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-800/30 text-sm">
                        {Object.keys(groups).sort().map((catName) => (
                          <Fragment key={catName}>
                            {/* Structured Category divider header row block with item count badge */}
                            <tr className="bg-[#2A082D] border-y border-pink-800/40">
                              <td colSpan="5" className="px-6 py-2.5">
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
                            
                            {groups[catName].map((p) => (
                              <tr key={p.id} className="hover:bg-[#2A082D]/50 transition-colors">
                                <td className="px-6 py-4 text-amber-300 font-mono font-bold">#{p.id}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=80'}
                                      alt=""
                                      className="w-10 h-10 object-cover rounded-lg border border-pink-800/40 bg-[#2A082D]"
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
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-3">
                                    <button
                                      onClick={() => handleUpdateStock(p.id, -1)}
                                      className="w-7 h-7 flex items-center justify-center bg-[#2A082D] border border-pink-800/40 hover:bg-[#330D3A] rounded-md font-bold text-amber-300 cursor-pointer active:scale-90"
                                    >
                                      -
                                    </button>
                                    <span className={`w-10 text-center font-extrabold ${p.stockQuantity < 5 ? 'text-red-400' : 'text-white'}`}>
                                      {p.stockQuantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateStock(p.id, 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-[#2A082D] border border-pink-800/40 hover:bg-[#330D3A] rounded-md font-bold text-amber-300 cursor-pointer active:scale-90"
                                    >
                                      +
                                    </button>
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
                            ))}
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
                    <div className="space-y-2 bg-[#2A082D] border border-pink-800/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-300 uppercase">Type Custom Category Name</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryField(false);
                            setNewCategoryName('');
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
                        placeholder="e.g. Bridal Jewellery"
                        className="w-full px-4 py-2.5 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white focus:border-amber-400 outline-none text-xs"
                      />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </main>

      {/* ── EDIT PRODUCT MODAL DIALOG ──────────── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#330D3A] border border-pink-800/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-pink-800/30 pb-4">
              <h3 className="text-lg font-bold text-white font-serif">Edit Product Parameters</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-amber-300 hover:text-white cursor-pointer p-1 rounded-full hover:bg-[#2A082D]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-sm focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Product Category</label>
                {!showEditNewCategoryField ? (
                  <div className="space-y-1">
                    <select
                      required
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white cursor-pointer focus:border-amber-400 transition-all font-bold text-sm outline-none"
                    >
                      <option value="">-- Select Category --</option>
                      {getUniqueCategories().map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowEditNewCategoryField(true)}
                      className="text-[10px] font-extrabold text-amber-300 hover:underline cursor-pointer block mt-1"
                    >
                      + Add New Category
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 bg-[#2A082D] border border-pink-800/50 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-amber-300 uppercase">Type Custom Category Name</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditNewCategoryField(false);
                          setEditNewCategoryName('');
                        }}
                        className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
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
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white resize-none text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Math.floor(Number(e.target.value)) })}
                    className="w-full px-4 py-2.5 bg-[#2A082D] border border-pink-800/50 rounded-xl text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Product Photo Upload: Camera, Gallery & Web Link */}
              <div className="space-y-3 bg-[#2A082D] border border-pink-800/50 p-4 rounded-2xl">
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Product Photo (Gallery, Camera, or URL)
                </label>

                {/* Live Image Preview if present */}
                {editingProduct.imageUrl ? (
                  <div className="flex items-center gap-4 bg-[#330D3A] p-3 rounded-xl border border-pink-800/40">
                    <img
                      src={editingProduct.imageUrl}
                      alt="Product Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-amber-400/30 shadow-md shrink-0 bg-[#2A082D]"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white font-serif">Current Photo ✓</p>
                      <p className="text-[10px] text-pink-100/70 truncate mt-0.5 font-mono">
                        {editingProduct.imageUrl.startsWith('data:') ? 'Base64 Uploaded File' : editingProduct.imageUrl}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                        className="mt-1.5 text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Upload Action Buttons: Gallery & Camera */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gallery Button */}
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, (res) => setEditingProduct(prev => ({ ...prev, imageUrl: res })))}
                      className="hidden"
                    />
                  </label>

                  {/* Camera Button */}
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#330D3A] hover:bg-[#4A1355] border border-pink-800/40 rounded-xl text-amber-300 font-extrabold text-xs cursor-pointer transition-all shadow-md active:scale-95">
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>Take Photo with Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageFileUpload(e, (res) => setEditingProduct(prev => ({ ...prev, imageUrl: res })))}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Fallback Direct URL Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    placeholder="Or paste external image URL (e.g. https://...)"
                    className="w-full px-3.5 py-2 bg-[#330D3A] border border-pink-800/50 rounded-xl text-white placeholder:text-pink-200/50 focus:border-amber-400 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-pink-800/30">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-[#2A082D] hover:bg-[#330D3A] border border-pink-800/40 rounded-xl text-xs font-bold text-pink-100/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer uppercase tracking-wider shadow-lg shadow-amber-400/25"
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
