import { motion } from 'framer-motion';
import { X, Star, ShoppingBag, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const cartItem = cartItems.find(item => item.product.id === product.id);
  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  // Generate multi-angle placeholder images based on main image
  const productImages = [
    product.imageUrl || fallbackImage,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
  ];

  // Placeholder specifications based on product category
  const getSpecs = (category) => {
    switch (category) {
      case 'Smart Devices':
        return [
          { name: 'Connectivity', value: 'Wi-Fi 6E, Bluetooth 5.3' },
          { name: 'Battery Life', value: 'Up to 24 Hours Active Use' },
          { name: 'Smart System', value: 'Apple/Google Smart Ecosystem' },
          { name: 'Warranty', value: '1 Year Limited Brand Warranty' }
        ];
      case 'Audio Gear':
        return [
          { name: 'Frequency Response', value: '4Hz - 40,000Hz' },
          { name: 'Noise Cancelling', value: 'Adaptive Hybrid ANC' },
          { name: 'Playtime', value: 'Up to 30 Hours (ANC On)' },
          { name: 'Warranty', value: '2 Year Premium Warranty' }
        ];
      case 'Premium Wearables':
        return [
          { name: 'Sensors', value: 'Optical Heart Rate, SpO2, Temperature' },
          { name: 'Water Resistance', value: '50m (5 ATM) Rated' },
          { name: 'Material', value: 'Grade 5 Aerospace Titanium' },
          { name: 'Warranty', value: '1 Year Brand Warranty' }
        ];
      case 'Gaming Setup':
        return [
          { name: 'Latency', value: 'Ultra-low 1ms Wireless' },
          { name: 'Customization', value: 'Per-key RGB / Custom Profiles' },
          { name: 'Build Quality', value: 'Aircraft-grade Aluminum / PBT' },
          { name: 'Warranty', value: '2 Year Esports Warranty' }
        ];
      default:
        return [
          { name: 'Quality', value: '100% Genuine Certified' },
          { name: 'Material', value: 'Premium Grade Materials' },
          { name: 'Shipping', value: 'Express Secure Delivery' },
          { name: 'Warranty', value: '1 Year Manufacturer Warranty' }
        ];
    }
  };

  const specs = getSpecs(product.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-[#330D3A] text-white rounded-3xl shadow-2xl border border-[#F39C12]/30 max-w-4xl w-full overflow-hidden z-10 flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#2A082D] hover:bg-[#4A1355] text-[#F39C12] hover:text-white transition-all z-20 cursor-pointer shadow-md border border-[#F39C12]/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F39C12]/20 bg-[#2A082D]">
          <div className="flex-1 flex items-center justify-center min-h-[280px] max-h-[380px] relative aspect-square rounded-2xl overflow-hidden bg-[#330D3A] border border-[#F39C12]/20 shadow-inner">
            <motion.img
              key={activeImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={productImages[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover max-h-[380px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />

            {/* Quick badges on image */}
            {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1.5 bg-[#F39C12] text-[#2A082D] text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                Only {product.stockQuantity} left
              </span>
            )}
            {product.stockQuantity === 0 && (
              <span className="absolute top-3 left-3 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Image Thumbnails Carousel */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-[#330D3A] transition-all cursor-pointer ${
                  activeImageIndex === i
                    ? 'border-[#F39C12] shadow-md scale-105'
                    : 'border-[#F39C12]/20 opacity-70 hover:opacity-100 hover:border-[#F39C12]/50'
                }`}
              >
                <img
                  src={img === productImages[0] ? img : fallbackImage}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Information Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-[#330D3A] overflow-y-auto max-h-[550px] md:max-h-[600px]">
          <div>
            {/* Category Tag & Rating Row */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="px-3 py-1 text-xs font-bold text-[#F39C12] bg-[#2A082D] rounded-full border border-[#F39C12]/30 uppercase tracking-wider">
                {product.category || 'General'}
              </span>
              
              {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center text-[#F39C12]">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-[#E2B6DC]/60 font-medium">/ 5.0</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3 font-serif">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F39C12]">
                ₹{Number(product.price).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Description */}
            <p className="text-[#E2B6DC] text-sm leading-relaxed mb-6 font-normal">
              {product.description || 'No description provided for this premium lifestyle item.'}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-[#2A082D] p-4 rounded-2xl border border-[#F39C12]/20">
              {specs.map((spec, i) => (
                <div key={i} className="text-xs">
                  <p className="text-[#F39C12] font-semibold mb-0.5">{spec.name}</p>
                  <p className="text-white font-medium">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Interaction Row */}
          <div>
            <div className="flex items-center justify-between gap-4 py-4 border-t border-[#F39C12]/20 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#F39C12] uppercase font-bold tracking-wider">Availability</span>
                <span className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                  {product.stockQuantity > 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-white">{product.stockQuantity} Items Available</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">Out of Stock</span>
                    </>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              {cartItem ? (
                <div className="flex items-center gap-3 bg-[#2A082D] rounded-2xl p-1.5 shadow-sm border border-[#F39C12]/30">
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[#F39C12] hover:bg-[#330D3A] rounded-xl disabled:opacity-40 transition-all font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stockQuantity}
                    className="w-10 h-10 flex items-center justify-center text-[#F39C12] hover:bg-[#330D3A] rounded-xl disabled:opacity-40 transition-all font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => addToCart(product.id, 1)}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#F39C12] hover:bg-[#D68910] active:scale-98 text-[#2A082D] text-sm font-extrabold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#F39C12]/20 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product.id, 1);
                      navigate('/cart');
                    }}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#8B005D] hover:bg-[#6B0047] active:scale-98 text-white text-sm font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#8B005D]/40 transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>

            {/* Reassurance Badges */}
            <div className="flex items-center justify-between text-[10px] text-[#E2B6DC]/70 font-semibold pt-3 border-t border-[#F39C12]/10">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#F39C12]" /> Free Express Delivery
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F39C12]" /> 100% Genuine
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#F39C12]" /> 30-Day Returns
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
