import { useEffect } from 'react';

export default function CartSidebar({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity }) {
  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Slide-out panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-surface-card shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary">Your Cart</h2>
            <span className="px-2.5 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              {cartItems.length} items
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-input rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <div className="w-16 h-16 bg-surface-input rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-text-primary font-medium">Your cart is empty</p>
              <p className="text-sm text-text-muted mt-1">Looks like you haven't added anything yet.</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-surface rounded-2xl border border-border group hover:border-primary/50 transition-colors">
                {/* Item Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-card shrink-0">
                  <img 
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
                    }}
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 bg-surface-input w-fit rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center text-text-primary hover:bg-surface-card rounded disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="w-6 h-6 flex items-center justify-center text-text-primary hover:bg-surface-card rounded disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-text-primary">
                      ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-danger hover:text-danger hover:bg-danger-bg p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Remove from cart"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border bg-surface-card mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-xl font-bold text-text-primary">
                ₹{totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-6">Shipping and taxes calculated at checkout.</p>
            <button className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2">
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
