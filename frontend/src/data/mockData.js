import React from 'react';
import { RiAppsLine } from 'react-icons/ri';
import { GiCrown, GiNecklaceDisplay, GiRing, GiSparkles, GiGemChain, GiDiamondRing, GiEarrings } from 'react-icons/gi';

export const getCategoryIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower === 'all') return React.createElement(RiAppsLine, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('kaleera')) return React.createElement(GiSparkles, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('chooda') || lower.includes('bangle') || lower.includes('kada')) return React.createElement(GiRing, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('bridal') || lower.includes('set') || lower.includes('polki') || lower.includes('kundan')) return React.createElement(GiCrown, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('hair') || lower.includes('gajra') || lower.includes('comb') || lower.includes('pin')) return React.createElement(GiNecklaceDisplay, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('necklace') || lower.includes('pendant') || lower.includes('chain')) return React.createElement(GiGemChain, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('earring') || lower.includes('jhumka')) return React.createElement(GiEarrings, { className: "w-4 h-4 mb-0.5" });
  if (lower.includes('ring')) return React.createElement(GiDiamondRing, { className: "w-4 h-4 mb-0.5" });
  
  // Default icon for custom categories (e.g. Payal, Accessories, etc.)
  return React.createElement(GiSparkles, { className: "w-4 h-4 mb-0.5 text-amber-300" });
};

export const getCategoryColor = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('kaleera')) return 'bg-[#F39C12]';
  if (lower.includes('chooda')) return 'bg-rose-400';
  if (lower.includes('bridal')) return 'bg-[#8B005D]';
  if (lower.includes('hair')) return 'bg-cyan-400';
  if (lower.includes('necklace')) return 'bg-amber-400';
  if (lower.includes('earring')) return 'bg-purple-400';
  if (lower.includes('ring')) return 'bg-emerald-400';
  return 'bg-amber-300';
};

export const categories = [
  { name: 'All', icon: getCategoryIcon('All') },
  { name: 'Kaleera', icon: getCategoryIcon('Kaleera') },
  { name: 'Chooda', icon: getCategoryIcon('Chooda') },
  { name: 'Bridal Jewellery', icon: getCategoryIcon('Bridal Jewellery') },
  { name: 'Hair Accessories', icon: getCategoryIcon('Hair Accessories') }
];

export const fallbackImage = 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=400&q=80';
