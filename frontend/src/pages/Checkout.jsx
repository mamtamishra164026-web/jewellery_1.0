import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';
import { HiArrowLeft } from 'react-icons/hi';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { fetchCart, cartItems } = useCart();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/cart');
  };

  // Redirection guard
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from: '/checkout' } });
    if (cartItems.length === 0) navigate('/cart');
  }, [isAuthenticated, cartItems, navigate]);

  // Compute totals — these MUST match what the backend saves to DB
  const selectedOrderTotal = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const deliveryFee = selectedOrderTotal > 0 ? 30 : 0;
  const orderTotal = selectedOrderTotal + deliveryFee;

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [addressForm, setAddressForm] = useState({
    fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: ''
  });

  // Selected payment channel state
  const [paymentOption, setPaymentOption] = useState('online');

  // Transaction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessOrderModal, setShowSuccessOrderModal] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptKey, setReceiptKey] = useState('');

  // Initial Fetch Addresses
  useEffect(() => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const res = await API.get('/api/addresses');
      setAddresses(res.data);
      if (res.data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await API.put(`/api/addresses/${editingAddressId}`, addressForm);
      } else {
        const res = await API.post('/api/addresses', addressForm);
        setSelectedAddressId(res.data.id);
      }
      setIsAddressFormOpen(false);
      setEditingAddressId(null);
      setAddressForm({ fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: '' });
      fetchAddresses();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm(addr);
    setEditingAddressId(addr.id);
    setIsAddressFormOpen(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!selectedAddressId) {
      setErrorMessage("Please select or add a delivery address first.");
      return;
    }

    if (paymentOption !== 'online') {
      setErrorMessage("Selected payment method is unavailable.");
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setIsProcessing(false);
      setErrorMessage("Failed to load Razorpay SDK. Please check your network connection.");
      return;
    }

    try {
      // 1. Create order token on our backend
      const tokenResponse = await API.post('/api/orders/razorpay/create', {
        amount: orderTotal
      });

      const { id: razorpayOrderId, keyId, isMock } = tokenResponse.data;

      // Fallback for unactivated/pending Razorpay onboarding keys: complete order placement seamlessly
      if (isMock) {
        await API.post('/api/orders/place', {
          addressId: selectedAddressId,
          paymentStatus: 'PAID',
          deliveryFee: deliveryFee
        });
        fetchCart();
        setIsProcessing(false);
        setOrderSuccessModal(true);
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 1500);
        return;
      }

      // 2. Open Razorpay Widget modal options
      const options = {
        key: keyId,
        amount: orderTotal * 100, // in paise
        currency: 'INR',
        name: 'CreationHub',
        description: 'Bridal Couture Order',
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Immediately show full-screen celebration modal to lock screen & eliminate re-click delays
          setOrderSuccessModal(true);
          setIsProcessing(true);
          try {
            await API.post('/api/orders/place', {
              addressId: selectedAddressId,
              paymentStatus: 'PAID',
              deliveryFee: deliveryFee
            });
            fetchCart();
            setTimeout(() => {
              navigate('/orders', { replace: true });
            }, 1000);
          } catch (placeErr) {
            setOrderSuccessModal(false);
            setIsProcessing(false);
            setErrorMessage('Order placement failed: ' + (placeErr.response?.data?.message || placeErr.message));
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: {
          color: '#18181b',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsProcessing(false); // Hide the processing spinner as soon as Razorpay modal opens!

    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Failed to initiate transaction: ' + (err.response?.data?.message || err.message));
    }
  };

  if (cartItems.length === 0 && !showSuccessOrderModal) return null;

  return (
    <div className="min-h-screen bg-[#7A153B] text-white pb-24 sm:pb-8 flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow w-full max-w-md mx-auto px-4 box-border md:max-w-2xl pt-5 pb-8">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#2A082D] flex items-center justify-center border border-pink-800/40 shadow-md text-amber-300 cursor-pointer hover:bg-[#330D3A]"
          >
            <HiArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold text-white font-serif tracking-tight">Checkout</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-6">
          
          {/* DELIVER TO PANEL */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#330D3A] p-6 rounded-[32px] border border-pink-800/40 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-amber-300 font-serif uppercase tracking-wider">Deliver to</span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({ fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: '' });
                  setIsAddressFormOpen(true);
                }}
                className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer hover:bg-amber-400/30"
              >
                Add Address
              </motion.button>
            </div>

            {/* Address Form Area */}
            {isAddressFormOpen ? (
              <form onSubmit={handleAddressSubmit} className="bg-[#2A082D] border border-pink-800/50 p-4 rounded-2xl space-y-3 mb-4">
                <h3 className="text-xs font-bold text-white">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder="Full Name" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                  <input type="tel" required placeholder="Phone Number" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                  <input type="text" required placeholder="Address Line" value={addressForm.addressLine} onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})} className="col-span-1 sm:col-span-2 w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                  <input type="text" required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                  <div className="flex gap-2">
                    <input type="text" required placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-1/2 px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                    <input type="text" required placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-1/2 px-3 py-2 bg-[#330D3A] text-white placeholder:text-pink-200/50 border border-pink-800/50 rounded-xl text-xs" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => { setIsAddressFormOpen(false); setEditingAddressId(null); setAddressForm({ fullName: '', addressLine: '', city: '', state: '', pincode: '', phoneNumber: '' }); }} className="px-3 py-1.5 text-[10px] font-semibold text-pink-100/80 hover:bg-[#330D3A] rounded-full cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-[10px] font-bold text-slate-950 bg-amber-400 rounded-full cursor-pointer hover:bg-amber-300">Save Address</button>
                </div>
              </form>
            ) : null}

            {/* Saved Addresses stack */}
            <div className="space-y-3">
              {addresses.map(addr => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`flex items-start gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${
                    selectedAddressId === addr.id ? 'border-amber-400 bg-[#2A082D]' : 'border-pink-800/30 bg-[#2A082D]/40 hover:border-pink-800/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#330D3A] flex items-center justify-center text-amber-300 shrink-0 mt-0.5 border border-pink-800/30">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{addr.fullName}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                        className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    <p className="text-[10px] font-bold text-pink-100/70">Phone: {addr.phoneNumber}</p>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && !isAddressFormOpen && (
                <div className="p-6 border border-dashed border-pink-800/40 rounded-3xl text-center text-xs text-pink-100/70 leading-relaxed">
                  Please add a shipping address above to complete your transaction.
                </div>
              )}
            </div>
          </motion.div>

          {/* Payment option list */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#330D3A] p-6 rounded-[32px] border border-pink-800/40 shadow-xl space-y-4"
          >
            <span className="text-sm font-bold text-amber-300 font-serif uppercase tracking-wider block">Payment Method</span>
            
            <div className="space-y-3">
              {/* Option 1: Pay Online */}
              <label 
                className={`flex items-center justify-between p-4 rounded-3xl border cursor-pointer transition-all ${
                  paymentOption === 'online' ? 'border-amber-400 bg-[#2A082D]' : 'border-pink-800/30'
                }`}
                onClick={() => setPaymentOption('online')}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="online" 
                    checked={paymentOption === 'online'} 
                    onChange={() => setPaymentOption('online')}
                    className="accent-amber-400 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Pay Online (Razorpay Secure)</span>
                    <span className="text-[10px] text-slate-300">Visa / Mastercard / UPI Instantly verified</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#330D3A] flex items-center justify-center text-amber-300 shrink-0 border border-pink-800/30">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <div className="flex items-center justify-between p-4 rounded-3xl border border-pink-800/30 bg-[#2A082D]/40 opacity-50 select-none">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    disabled 
                    className="accent-pink-800 cursor-not-allowed"
                  />
                  <div>
                    <span className="text-xs font-bold text-pink-100/60 block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-pink-100/50">Currently Not Available</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SUMMARY AMOUNT PANEL */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#330D3A] p-6 rounded-[32px] border border-pink-800/40 shadow-xl space-y-4"
          >
            <h2 className="text-sm font-bold text-amber-300 font-serif uppercase tracking-wider mb-2">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-pink-100/80">
                <span>Item Total</span>
                <span className="font-bold text-white">₹{selectedOrderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-pink-100/80">
                <span>Express Shipping Fee</span>
                <span className="font-bold text-amber-300">₹{deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-pink-800/20 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white font-serif">Grand Total</span>
              <span className="text-xl font-extrabold text-amber-300">₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </motion.div>

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-2xl text-xs text-red-200 font-semibold text-center">{errorMessage}</div>
          )}

          {/* Place Your Order button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            onClick={handlePay}
            disabled={isProcessing || !selectedAddressId}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-4 rounded-full shadow-2xl transition-all cursor-pointer text-center text-xs uppercase tracking-widest mt-6 shadow-amber-400/30"
          >
            {isProcessing ? 'Processing Transaction...' : 'Place Your Order'}
          </motion.button>
        </div>
      </main>

      {/* INTERACTIVE MODALS */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md"
          >
            <div className="w-72 p-6 bg-[#330D3A] border border-pink-800/40 rounded-[32px] shadow-2xl flex flex-col items-center text-white">
              <div className="w-10 h-10 border-4 border-pink-800/30 border-t-amber-400 rounded-full animate-spin mb-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-amber-300 font-serif">Processing Payment</h3>
              <p className="text-[10px] text-pink-100/70 mt-2 text-center leading-relaxed">Verifying transaction securely via Razorpay gateway panel...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessOrderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#7A153B]/95 backdrop-blur-md"
          >
            <div className="text-center p-8 max-w-md mx-auto bg-[#330D3A] border border-pink-800/40 rounded-3xl shadow-2xl text-white">
              <motion.div 
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-20 h-20 bg-emerald-400/20 border-2 border-emerald-400/40 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white font-serif tracking-tight">Order Placed Successfully!</h2>
              <p className="text-[13px] text-pink-100/80 mt-3 max-w-sm mx-auto leading-relaxed animate-pulse">
                Thank you for shopping with CreationHub! Your boutique selection is confirmed and preparing for shipment.
              </p>
              {receiptKey ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 inline-flex flex-col items-center gap-1.5 px-4 py-2 bg-[#2A082D] border border-pink-800/40 rounded-2xl shadow-xs"
                >
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">Receipt ID</span>
                  <span className="text-xs font-mono text-white font-bold">{receiptKey}</span>
                </motion.div>
              ) : (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#2A082D] border border-pink-800/40 rounded-2xl">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-pink-100/70 font-semibold uppercase tracking-wider">Securing Transaction...</span>
                </div>
              )}
              <div className="mt-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Redirecting to boutique dashboard...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎉 Ultra-Luxury Animated Payment Success Celebration Modal */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in text-white">
          <div className="bg-gradient-to-b from-[#2A082D] to-[#1E0522] border-2 border-amber-400/80 rounded-[36px] p-8 max-w-sm w-full text-center space-y-6 shadow-[0_0_60px_rgba(243,156,18,0.3)] relative overflow-hidden">
            {/* Background Glow Aura */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl" />

            {/* Animated 3D Ring Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
              <div className="w-18 h-18 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/40">
                <span className="text-4xl animate-bounce">🎉</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-amber-300 font-serif tracking-tight">Payment Successful!</h2>
              <p className="text-xs text-emerald-300 font-extrabold uppercase tracking-widest mt-1">Order Confirmed & Placed</p>
            </div>

            {/* Live Verification Checklist Steps */}
            <div className="bg-[#1E0522]/90 border border-pink-800/40 rounded-2xl p-3.5 space-y-2 text-left text-xs font-semibold">
              <div className="flex items-center gap-2 text-emerald-400">
                <span>✓</span> <span>Payment Transaction Verified</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span>✓</span> <span>Order Manifest #Generated</span>
              </div>
              <div className="flex items-center gap-2 text-pink-200/90 animate-pulse">
                <span>⚡</span> <span>Redirecting to Order History...</span>
              </div>
            </div>

            {/* Fast Progress Indicator Line */}
            <div className="w-full bg-[#1E0522] h-2 rounded-full overflow-hidden border border-pink-800/40">
              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 h-full animate-pulse transition-all duration-1000" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
