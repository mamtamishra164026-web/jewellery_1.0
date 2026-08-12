import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Tab state: 'info' | 'addresses'
  const [activeTab, setActiveTab] = useState('info');

  // Personal Info Form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: ''
  });

  // Sync profile details if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Load saved Addresses on mount
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await API.get('/api/addresses');
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg({ type: '', text: '' });
    try {
      const res = await API.put('/api/auth/profile', profileForm);
      setInfoMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update Auth context user state by refreshing session details
      if (user) {
        const updatedUser = { ...user, username: res.data.username, email: res.data.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage')); // Broadcast storage update
      }
    } catch (err) {
      console.error('Failed to update profile details:', err);
      setInfoMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update credentials.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await API.put(`/api/addresses/${editingAddressId}`, addressForm);
      } else {
        await API.post('/api/addresses', addressForm);
      }
      setIsAddressFormOpen(false);
      setEditingAddressId(null);
      setAddressForm({ fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: '' });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
      alert('Failed to save address details.');
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm({
      fullName: addr.fullName,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phoneNumber: addr.phoneNumber
    });
    setEditingAddressId(addr.id);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to permanently delete this delivery address?')) return;
    try {
      await API.delete(`/api/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address.');
    }
  };

  return (
    <div className="min-h-screen bg-[#7A153B] text-white pb-24 sm:pb-8 flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <main className="flex-grow w-full max-w-md mx-auto px-4 box-border md:max-w-2xl pt-5 pb-12">
          {/* Header strip */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-[#2A082D] flex items-center justify-center border border-pink-800/40 shadow-md text-amber-300 cursor-pointer hover:bg-[#330D3A]"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-xl font-bold text-white font-serif tracking-tight">My Profile</h1>
            <div className="w-10" />
          </div>

          {/* Dual Tab Switch */}
          <div className="flex bg-[#2A082D] border border-pink-800/40 p-1.5 rounded-full mb-8 shadow-md">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'text-pink-100 hover:text-amber-300'
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'text-pink-100 hover:text-amber-300'
              }`}
            >
              My Addresses
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: PERSONAL INFO */}
            {activeTab === 'info' && (
              <motion.div
                key="tab-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-[#330D3A] p-6 sm:p-8 rounded-[32px] border border-pink-800/40 shadow-xl space-y-6 text-white"
              >
                <div className="flex items-center gap-4 border-b border-pink-800/30 pb-4">
                  <div className="w-12 h-12 bg-[#2A082D] border border-pink-800/40 rounded-full flex items-center justify-center text-amber-300 text-base font-serif font-bold shadow-md">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-serif">Credentials Console</h2>
                    <p className="text-[10px] text-pink-100/70">View and update active session parameters</p>
                  </div>
                </div>

                {infoMsg.text && (
                  <div className={`p-3 border rounded-2xl text-xs text-center font-bold ${
                    infoMsg.type === 'success' 
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' 
                      : 'bg-red-950/80 border-red-500 text-red-200'
                  }`}>
                    {infoMsg.text}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">Username *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="Your unique handle"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-2xl text-xs text-white font-bold focus:border-amber-400 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-[#2A082D] border border-pink-800/50 rounded-2xl text-xs text-white font-bold focus:border-amber-400 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={infoLoading}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-full transition-all shadow-lg shadow-amber-400/25 cursor-pointer text-xs uppercase tracking-widest mt-4"
                  >
                    {infoLoading ? 'Updating Profile...' : 'Save Profile Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 2: MY ADDRESSES */}
            {activeTab === 'addresses' && (
              <motion.div
                key="tab-addresses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* DELIVER TO PANEL */}
                <div className="bg-[#330D3A] p-6 sm:p-8 rounded-[32px] border border-pink-800/40 shadow-xl text-white">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-amber-300 font-serif tracking-wide uppercase tracking-widest">Saved Addresses</span>
                    {!isAddressFormOpen && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressForm({ fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: '' });
                          setIsAddressFormOpen(true);
                        }}
                        className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer flex items-center gap-1 hover:bg-amber-400/30"
                      >
                        <Plus className="w-3 h-3" />
                        Add New
                      </motion.button>
                    )}
                  </div>

                  {/* Add / Edit Address form inline */}
                  {isAddressFormOpen && (
                    <form onSubmit={handleAddressSubmit} className="bg-[#2A082D] border border-pink-800/50 p-4 rounded-3xl space-y-3 mb-6">
                      <h3 className="text-xs font-bold text-white font-serif uppercase tracking-wider">{editingAddressId ? 'Edit saved address' : 'Add new address'}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required placeholder="Full Name *" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                        <input type="tel" required placeholder="Phone Number *" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                        <input type="text" required placeholder="Address Line *" value={addressForm.addressLine} onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})} className="col-span-1 sm:col-span-2 w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                        <input type="text" required placeholder="City *" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                        <div className="flex gap-2">
                          <input type="text" required placeholder="State *" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-1/2 px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                          <input type="text" required placeholder="Pincode *" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-1/2 px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={() => { setIsAddressFormOpen(false); setEditingAddressId(null); }} className="px-3 py-1.5 text-[10px] font-semibold text-pink-100/80 hover:bg-[#330D3A] rounded-full cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 text-[10px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full cursor-pointer uppercase tracking-wider">Save Address</button>
                      </div>
                    </form>
                  )}

                  {/* Loop saved Addresses */}
                  {addressLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="p-8 border border-dashed border-pink-800/40 rounded-3xl text-center text-xs text-pink-100/70 leading-relaxed font-serif italic">
                      No saved delivery addresses yet. Add one above to get started!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          className="flex items-start gap-4 p-4 rounded-3xl border border-pink-800/30 bg-[#2A082D] hover:border-pink-800/60 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#330D3A] flex items-center justify-center text-amber-300 shrink-0 mt-0.5 border border-pink-800/30">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{addr.fullName}</span>
                              
                              {/* Edit & Delete Action Nodes */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleEditAddress(addr)}
                                  className="p-1 rounded-lg text-amber-300 hover:bg-[#330D3A] transition-all cursor-pointer"
                                  title="Edit Address"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-1 rounded-lg text-red-400 hover:bg-[#330D3A] transition-all cursor-pointer"
                                  title="Delete Address"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-[10px] font-bold text-pink-100/70">Phone: {addr.phoneNumber}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
}
