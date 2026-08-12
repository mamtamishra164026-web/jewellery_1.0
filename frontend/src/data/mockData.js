import { RiAppsLine } from 'react-icons/ri';
import { GiCrown, GiNecklaceDisplay, GiRing, GiSparkles } from 'react-icons/gi';
import React from 'react';

export const categories = [
  { name: 'All', icon: React.createElement(RiAppsLine, { className: "w-5 h-5 mb-0.5" }) },
  { name: 'Kaleera', icon: React.createElement(GiSparkles, { className: "w-5 h-5 mb-0.5" }) },
  { name: 'Chooda', icon: React.createElement(GiRing, { className: "w-5 h-5 mb-0.5" }) },
  { name: 'Bridal Jewellery', icon: React.createElement(GiCrown, { className: "w-5 h-5 mb-0.5" }) },
  { name: 'Hair Accessories', icon: React.createElement(GiNecklaceDisplay, { className: "w-5 h-5 mb-0.5" }) }
];

export const fallbackImage = 'https://images.unsplash.com/photo-1611591475285-a36ad5e14391?w=400&q=80';

