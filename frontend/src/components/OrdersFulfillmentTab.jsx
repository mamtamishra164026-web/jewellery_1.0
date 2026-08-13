import { useState } from 'react';

export default function OrdersFulfillmentTab({ orders, ordersLoading, fetchOrders, handleUpdateOrderStatus }) {
  const [orderSubTab, setOrderSubTab] = useState('ALL');
  const [viewingOrderDetails, setViewingOrderDetails] = useState(null);

  // Filter logic
  const filteredOrders = orders.filter(o => {
    if (orderSubTab === 'ALL') return true;
    return (o.orderStatus || 'PLACED') === orderSubTab;
  });

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${item.product?.name || 'Product'}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">₹${Number(item.price).toFixed(2)}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">₹${Number(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Manifest #${order.id} - CreationHub</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7A153B; pb: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #7A153B; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f8f8f8; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
          .total-box { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">CreationHub Bridal Couture</div>
            <div>Enterprise Order Invoice / Shipping Manifest</div>
          </div>
          <div style="text-align:right;">
            <div><strong>ORDER ID: #${order.id}</strong></div>
            <div>Date: ${new Date(order.orderDate).toLocaleString()}</div>
            <div>Status: ${order.paymentStatus || 'PAID'}</div>
          </div>
        </div>

        <div class="section">
          <h3>Customer & Shipping Details</h3>
          <p><strong>Name:</strong> ${order.shippingFullName || order.username || 'N/A'}</p>
          <p><strong>Phone:</strong> ${order.shippingPhone || 'N/A'}</p>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'N/A'}</p>
        </div>

        <div class="section">
          <h3>Purchased Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="total-box">
          <p style="margin:4px 0; font-size:14px; color:#555;">Items Subtotal: ₹${(order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0).toFixed(2)}</p>
          <p style="margin:4px 0; font-size:14px; color:#555;">Express Delivery Charge: ₹${((Number(order.totalAmount) - (order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0)) > 0 ? (Number(order.totalAmount) - (order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0)).toFixed(2) : '30.00')}</p>
          <p style="margin:8px 0; font-size:18px; color:#7A153B; font-weight:bold;">Grand Total Paid: ₹${Number(order.totalAmount).toFixed(2)}</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-slide-up text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-800/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Fulfillment & Order History</h2>
          <p className="text-xs text-pink-100/70 mt-0.5">Manage live customer orders, update dispatch statuses, and view complete order manifests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#2A082D] border border-pink-800/40 hover:border-amber-400/50 rounded-xl text-xs font-extrabold text-amber-300 transition-all cursor-pointer shadow-md"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Premium Sub-Navigation Status Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setOrderSubTab(tab)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 ${
              orderSubTab === tab
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md scale-105'
                : 'bg-[#2A082D] text-pink-100 border border-pink-800/40 hover:text-amber-300'
            }`}
          >
            <span>{tab === 'PLACED' ? 'New Orders' : tab}</span>
            {tab === 'PLACED' ? (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                orderSubTab === tab ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white animate-pulse'
              }`}>
                {orders.filter(o => (o.orderStatus || 'PLACED') === 'PLACED').length}
              </span>
            ) : tab !== 'ALL' ? (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
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
                  <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4 whitespace-normal break-words min-w-[180px]">
                      <p className="text-slate-300 text-xs line-clamp-2" title={o.shippingAddress || 'No Address Provided'}>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingOrderDetails(o)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-extrabold cursor-pointer transition-all shadow-md hover:scale-105"
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enterprise Order Details Modal */}
      {viewingOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1E0522] border-2 border-amber-400/50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-white">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-pink-800/40 pb-4">
              <div>
                <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">Order Manifest</span>
                <h3 className="text-2xl font-bold font-serif text-white mt-0.5">Order #{viewingOrderDetails.id}</h3>
                <p className="text-xs text-pink-100/70">{new Date(viewingOrderDetails.orderDate).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setViewingOrderDetails(null)}
                className="w-9 h-9 rounded-full bg-[#330D3A] border border-pink-800/40 flex items-center justify-center text-pink-200 hover:text-white hover:bg-pink-900/50 transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2A082D] border border-pink-800/40 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Customer Info</p>
                <p className="text-sm font-bold text-white">{viewingOrderDetails.shippingFullName || viewingOrderDetails.username || 'N/A'}</p>
                <p className="text-xs text-pink-100/80">📞 Phone: <strong className="text-white">{viewingOrderDetails.shippingPhone || 'N/A'}</strong></p>
                <p className="text-xs text-pink-100/80">✉️ Email: <strong className="text-white">{viewingOrderDetails.email || viewingOrderDetails.user?.email || 'N/A'}</strong></p>
              </div>

              <div className="bg-[#2A082D] border border-pink-800/40 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Shipping Address</p>
                <p className="text-xs text-pink-100/90 leading-relaxed whitespace-pre-wrap">{viewingOrderDetails.shippingAddress || 'No address provided'}</p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Purchased Items Breakdown</p>
              <div className="bg-[#2A082D] border border-pink-800/40 rounded-2xl divide-y divide-pink-800/30 overflow-hidden">
                {viewingOrderDetails.items?.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&q=80'}
                        alt={item.product?.name || ''}
                        className="w-12 h-12 object-cover rounded-xl border border-amber-400/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.product?.name}</p>
                        <p className="text-xs text-pink-100/70">{item.quantity} unit{item.quantity > 1 ? 's' : ''} × ₹{Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-amber-300">₹{Number(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Financial Summary Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#2A082D] border border-amber-400/30 p-4 rounded-2xl">
              <div>
                <span className="text-xs text-pink-100/70">Payment Status:</span>
                <span className="ml-2 font-bold text-emerald-400 uppercase tracking-wider">{viewingOrderDetails.paymentStatus || 'PAID'}</span>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                {(() => {
                  const subtotal = viewingOrderDetails.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
                  const deliveryFee = Number(viewingOrderDetails.totalAmount) - subtotal;
                  return (
                    <>
                      <div className="text-xs text-pink-100/80 flex gap-4">
                        <span>Subtotal: <strong className="text-white">₹{subtotal.toFixed(2)}</strong></span>
                        <span>Express Delivery: <strong className="text-amber-300">₹{deliveryFee > 0 ? deliveryFee.toFixed(2) : '30.00'}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-pink-100/80">Grand Total:</span>
                        <span className="text-2xl font-black text-amber-300">₹{Number(viewingOrderDetails.totalAmount).toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handlePrintInvoice(viewingOrderDetails)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                🖨️ Print Order Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
