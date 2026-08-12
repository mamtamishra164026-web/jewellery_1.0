import { Link } from 'react-router-dom';

export default function Footer() {
  const handleScrollToStory = (e) => {
    e.preventDefault();
    document.getElementById("brand-story")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#2A0835] border-t border-[#F39C12]/30 pt-10 pb-28 md:pb-12 px-4 text-center select-none font-sans">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        
        {/* Section 1: Centralized Lowercase Brand Story Overlay */}
        <p 
          id="brand-story" 
          className="font-serif italic text-[#E2B6DC] text-sm max-w-md mx-auto mb-6 tracking-wide leading-relaxed"
        >
          CreationHub — Elevating your special day through handcrafted royal bridal sets & accessories.
        </p>

        {/* Section 2: Flat Centered Action Anchors Row */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[11px] font-bold tracking-widest uppercase mb-6 text-[#F39C12]">
          <a 
            href="#brand-story" 
            onClick={handleScrollToStory}
            className="hover:text-white transition-colors duration-200 cursor-pointer"
          >
            About Brand
          </a>
          <Link 
            to="/orders" 
            className="hover:text-white transition-colors duration-200"
          >
            My Orders
          </Link>
          <Link 
            to="/cart" 
            className="hover:text-white transition-colors duration-200"
          >
            Shopping Bag
          </Link>
        </div>

        {/* Section 3: Fine-line Micro Copyright Text */}
        <p className="text-[10px] tracking-wider text-[#E2B6DC]/60">
          &copy; {new Date().getFullYear()} CREATIONHUB BRIDAL COUTURE. ALL RIGHTS RESERVED.
        </p>

      </div>
    </footer>
  );
}
