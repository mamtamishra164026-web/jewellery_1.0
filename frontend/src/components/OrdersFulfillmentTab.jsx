import { useState } from 'react';

export default function OrdersFulfillmentTab({ orders, ordersLoading, fetchOrders, handleUpdateOrderStatus }) {
  const [orderSubTab, setOrderSubTab] = useState('ALL');

  // Filter logic
  const filteredOrders = orders.filter(o => {
    if (orderSubTab === 'ALL') return true;
    return (o.orderStatus || 'PLACED') === orderSubTab;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Fulfillment & Order History</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-surface-input border border-border hover:border-primary/50 rounded-xl text-xs font-semibold text-text-primary transition-all cursor-pointer"
        >
          Refresh Orders
        </button>
      </div>

      {/* Premium Sub-Navigation Status Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setOrderSubTab(tab)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center ${
              orderSubTab === tab
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:text-amber-300'
            }`}
          >
            {tab === 'PLACED' ? 'New Orders' : tab}
            {tab === 'PLACED' ? (
              <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs font-extrabold ${
                orderSubTab === tab ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
              }`}>
                {orders.filter(o => (o.orderStatus || 'PLACED') === 'PLACED').length}
              </span>
            ) : tab !== 'ALL' ? (
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                orderSubTab === tab ? 'bg-slate-950 text-amber-400' : 'bg-[#330D3A] text-pink-200 border border-pink-800/40'
              }`}>
                {orders.filter(o => (o.orderStatus || 'PLACED') === tab).length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#330D3A] border border-pink-800/40 p-12 text-center rounded-2xl">
          <p className="text-pink-100/80 text-base font-medium">No orders match this status filter.</p>
        </div>
      ) : (
        <div className="bg-[#330D3A] border border-pink-800/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-800/40 bg-[#2A082D] text-amber-300 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Shipping Destination</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-800/20 text-sm">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#2A082D]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-mono font-bold mb-1">#{o.id}</p>
                      <p className="text-xs text-slate-300">{new Date(o.orderDate).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{o.shippingFullName || o.username || o.user?.username || 'N/A'}</p>
                      <p className="text-slate-300 text-[11px] font-mono mt-0.5">{o.shippingPhone || o.email || o.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words min-w-[200px]">
                      <p className="text-slate-300 text-xs" title={o.shippingAddress || 'No Address Provided'}>
                        {o.shippingAddress || 'No Address Provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-amber-300 font-extrabold">
                      ₹{Number(o.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {o.paymentStatus === 'PAID' ? (
                        <span className="bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                          PAID
                        </span>
                      ) : (
                        <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
                          {o.paymentStatus || 'PENDING'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.orderStatus || 'PLACED'}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-pink-800/50 bg-[#2A082D] text-white cursor-pointer transition-colors focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      >
                        <option value="PLACED" className="bg-[#330D3A] text-white">PLACED (New)</option>
                        <option value="PROCESSING" className="bg-[#330D3A] text-white">PROCESSING</option>
                        <option value="SHIPPED" className="bg-[#330D3A] text-white">SHIPPED</option>
                        <option value="DELIVERED" className="bg-[#330D3A] text-white">DELIVERED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
