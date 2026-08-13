import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { HiArrowLeft } from 'react-icons/hi';
import Navbar from '../components/Navbar';

export default function MyOrders() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyOrders = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/api/orders/my-orders');
        setOrders(response.data || []);
      } catch (err) {
        console.error('Failed to fetch order history:', err);
        setError('Could not retrieve your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <div className="min-h-screen bg-[#7A153B] text-white pb-24 sm:pb-8 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Content Area */}
      <main className="flex-grow w-full max-w-md mx-auto px-4 box-border md:max-w-5xl pt-5 pb-8">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#2A082D] flex items-center justify-center border border-pink-800/40 shadow-md text-amber-300 cursor-pointer hover:bg-[#330D3A] transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-tight text-center">Order History</h1>
            <p className="text-xs text-pink-100/80 mt-0.5 text-center">Review and track your previous transactions</p>
          </div>
          <div className="w-10" />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          /* Empty State component */
          <div className="bg-[#330D3A] border border-pink-800/40 p-12 text-center rounded-3xl shadow-2xl space-y-6 max-w-lg mx-auto mt-8">
            <div className="w-20 h-20 bg-[#2A082D] border border-pink-800/40 rounded-full flex items-center justify-center mx-auto text-amber-300 shadow-md">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1,0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0,1-1.12-1.243l1.264-12A1.125 1.125 0 0,1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1,1-.75 0 .375.375 0 0,1 .75 0Zm7.5 0a.375.375 0 1,1-.75 0 .375.375 0 0,1 .75 0Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-serif tracking-tight">You haven't shopped anything yet!</h3>
              <p className="text-pink-100/80 text-sm leading-relaxed max-w-sm mx-auto">
                Discover our curated royal collection of Kaleeras, Choodas, and Kundan sets. Your next favorite item is waiting!
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-full transition-all shadow-lg shadow-amber-400/25 cursor-pointer text-xs uppercase tracking-widest"
            >
              Explore Creation / Start Shopping
            </button>
          </div>
        ) : error ? (
          <div className="bg-[#330D3A] border border-pink-800/40 p-8 rounded-2xl text-center shadow-lg">
            <p className="text-red-300 font-medium mb-4">{error}</p>
            <button
              onClick={fetchMyOrders}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          /* Orders list */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#330D3A] border border-pink-800/40 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-800/30 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-amber-300 font-mono font-bold">ORDER ID: #{order.id}</p>
                    {order.transactionId && (
                      <p className="text-[11px] text-pink-100/70 font-mono">TXN ID: {order.transactionId}</p>
                    )}
                    <p className="text-xs text-slate-300">Placed on: {new Date(order.orderDate).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-pink-100/80">Total Paid:</span>
                    <span className="text-xl font-extrabold text-amber-300">₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                  {/* Items Purchased list */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Items Purchased</p>
                    <div className="divide-y divide-pink-800/30">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => item.product?.id && navigate(`/product/${item.product.id}`)}
                          className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 gap-3 sm:gap-4 group cursor-pointer hover:bg-pink-900/20 px-2 rounded-2xl transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-grow">
                            <img
                              src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=80'}
                              alt={item.product?.name || ''}
                              className="w-12 h-12 object-cover rounded-xl border border-amber-400/30 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-grow">
                              <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[380px]">
                                {item.product?.name}
                              </p>
                              <p className="text-pink-100/70 text-xs mt-0.5">
                                {item.quantity} unit{item.quantity > 1 ? 's' : ''} at ₹{Number(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-amber-300">
                              ₹{Number(item.price * item.quantity).toFixed(2)}
                            </p>
                            <span className="text-[9px] font-bold text-pink-200/60 uppercase tracking-wider group-hover:underline">View Product →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                {(() => {
                  const subtotal = order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
                  const deliveryFee = Number(order.totalAmount) - subtotal;
                  return (
                    <div className="pt-4 border-t border-dashed border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-text-secondary">
                      <div className="flex gap-4">
                        <span>Subtotal: <strong className="text-text-primary">₹{subtotal.toFixed(2)}</strong></span>
                        {deliveryFee > 0.01 && (
                          <span>Delivery Fee: <strong className="text-text-primary">₹{deliveryFee.toFixed(2)}</strong></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          Status: {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Flipkart-Style Tracking Stepper */}
                <div className="pt-6 border-t border-border mt-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Order Tracking</p>
                  <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
                    {/* Background Line */}
                    <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full" />
                    
                    {/* Active progress bar line fill */}
                    <div 
                      className="absolute left-6 top-4 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${
                          ((order.orderStatus === 'DELIVERED' ? 3 : order.orderStatus === 'SHIPPED' ? 2 : order.orderStatus === 'PROCESSING' ? 1 : 0) / 3) * 85
                        }%` 
                      }}
                    />

                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((label, index) => {
                      const currentStep = order.orderStatus === 'DELIVERED' ? 3 : order.orderStatus === 'SHIPPED' ? 2 : order.orderStatus === 'PROCESSING' ? 1 : 0;
                      const isCompleted = index <= currentStep;
                      const isActive = index === currentStep;

                      return (
                        <div key={label} className="flex flex-col items-center relative z-10 shrink-0">
                          {/* Circle Node */}
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isActive 
                                ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                                : isCompleted
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>

                          {/* Label Stacked Underneath */}
                          <span 
                            className={`text-[11px] font-bold mt-2 tracking-wide transition-all ${
                              isActive
                                ? 'text-indigo-600'
                                : isCompleted
                                ? 'text-slate-700 font-semibold'
                                : 'text-slate-400 font-medium'
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
