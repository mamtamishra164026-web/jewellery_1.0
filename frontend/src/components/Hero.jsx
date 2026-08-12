import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_BANNER = {
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
    },
    {
      id: 3,
      productId: 11,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      label: "Royal Maharani Collection",
      title: "24k Kundan & Pearl Sets"
    }
  ]
};

export default function Hero() {
  const navigate = useNavigate();
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [index, setIndex] = useState(0);

  const loadBannerConfig = () => {
    try {
      const saved = localStorage.getItem('creation_banner_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBanner({
          badgeText: parsed.badgeText || DEFAULT_BANNER.badgeText,
          headingLine1: parsed.headingLine1 || DEFAULT_BANNER.headingLine1,
          headingLine2: parsed.headingLine2 || DEFAULT_BANNER.headingLine2,
          descriptionText: parsed.descriptionText || DEFAULT_BANNER.descriptionText,
          buttonText: parsed.buttonText || DEFAULT_BANNER.buttonText,
          slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : DEFAULT_BANNER.slides
        });
      } else {
        setBanner(DEFAULT_BANNER);
      }
    } catch (e) {
      console.error('Failed to parse banner config:', e);
      setBanner(DEFAULT_BANNER);
    }
  };

  useEffect(() => {
    loadBannerConfig();
    window.addEventListener('banner-update', loadBannerConfig);
    return () => window.removeEventListener('banner-update', loadBannerConfig);
  }, []);

  const slides = banner.slides && banner.slides.length > 0 ? banner.slides : DEFAULT_BANNER.slides;

  // Reset index if slides shrink
  useEffect(() => {
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [slides.length, index]);

  // Automatic slide cycle for image showcase (every 4.5 seconds)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[index] || slides[0];

  return (
    <section className="w-full bg-[#7A153B] py-4 px-4 sm:px-6 lg:px-8">
      {/* ── FLOATING HERO CARD CONTAINER (#330D3A Jamun Purple) ── */}
      <div className="max-w-7xl mx-auto my-2 rounded-3xl overflow-hidden bg-[#330D3A] border border-pink-900/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-10 lg:p-12 relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* Ambient lighting glow inside hero card */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#7A153B]/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#F39C12]/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Left Column: Brand Copy Typography */}
        <div className="flex-1 space-y-6 text-left w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-bold tracking-widest text-[#F39C12] uppercase bg-[#2A082D]/90 border border-[#F39C12]/40 rounded-full px-4 py-1.5 shadow-md inline-flex items-center gap-1.5">
              <span className="text-[#F39C12]">✦</span> {banner.badgeText || "ROYAL BRIDAL COUTURE COLLECTION"}
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              {banner.headingLine1 || "Elevate Your Wedding Day"} <br />
              <span className="italic font-normal text-[#F39C12]">{banner.headingLine2 || "Bridal Grace & Glamour"}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[#E2B6DC] max-w-xl text-xs sm:text-sm md:text-base leading-relaxed font-sans"
            >
              {banner.descriptionText}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => {
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#F39C12] text-[#2A082D] hover:bg-[#D68910] font-extrabold rounded-full px-8 py-3.5 text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-[#F39C12]/30 hover:shadow-[#F39C12]/50 active:scale-98"
            >
              {banner.buttonText || "EXPLORE BRIDAL COLLECTIONS"}
            </button>
          </motion.div>
        </div>

        {/* Right Column: Inner Image Card (Right Side Jewelry Showcase) */}
        {currentSlide && (
          <div className="flex-shrink-0 w-full lg:max-w-[400px] aspect-[4/3] xs:aspect-[16/10] lg:aspect-[4/5] relative flex items-center justify-center z-10">
            <div 
              onClick={() => {
                if (currentSlide.productId) {
                  navigate(`/product/${currentSlide.productId}`);
                }
              }}
              className="relative w-full h-full rounded-2xl overflow-hidden bg-[#2A082D] border border-[#F39C12]/20 shadow-2xl p-4 flex flex-col justify-end cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform duration-300 group"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={`img-${currentSlide.id || index}`}
                  src={currentSlide.image} 
                  alt={currentSlide.title || "Banner Slide"} 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.55 }}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-700"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D] via-[#2A082D]/40 to-transparent pointer-events-none" />
              
              {/* Active dots pagination strip inside card */}
              {slides.length > 1 && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#2A082D]/80 backdrop-blur-md px-2.5 py-1.5 rounded-full z-20 border border-[#F39C12]/40 shadow-md"
                >
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === index ? 'w-4.5 bg-[#F39C12]' : 'w-1.5 bg-white/40'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="relative z-10 text-white p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`meta-${currentSlide.id || index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentSlide.label && (
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#F39C12]">
                        {currentSlide.label}
                      </span>
                    )}
                    {currentSlide.title && (
                      <h3 className="text-xl font-serif font-bold tracking-tight text-white mt-0.5">
                        {currentSlide.title}
                      </h3>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
