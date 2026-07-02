import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function FirstCard() {
  return (
    <section className="w-full px-6 py-4">
      {/* Container with background image and smooth rounded corners */}
      <div 
        className="w-full min-h-[340px] md:min-h-[400px] rounded-2xl relative overflow-hidden bg-cover bg-center flex flex-col justify-center px-8 md:px-16"
        style={{ 
          // Replace with your local asset path or a scenic Cambodian background URL
          backgroundImage: "url('/Angkorwat-fristcard.jpg')"
        }}
      >
        {/* Dark subtle overlay matrix to ensure high text readability over the image */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

        {/* Content Layout (Relative to stay above overlay layer) */}
        <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4 text-white">
          
          {/* Top Real-time Dynamic Badge Component */}
          <div className="flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3,200+ travelers exploring Cambodia this week</span>
          </div>

          {/* Subtitle / Action Tracker Tagline */}
          <div className="flex items-center gap-2 text-[11px] md:text-xs tracking-[0.25em] font-medium uppercase text-gray-300 ml-0.5 mt-2">
            <span>🇰🇭 DISCOVER</span>
            <span className="text-gray-500">•</span>
            <span>PLAN</span>
            <span className="text-gray-500">•</span>
            <span>EXPLORE</span>
          </div>

          {/* Main Title Heading using Playfair Display font stack styles */}
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-semibold tracking-wide leading-[1.15] text-[#F9F6F0] drop-shadow-sm max-w-xl">
            THE KINGDOM <br />
            OF WONDER AWAITS
          </h1>

          {/* Brief Informational Description copy block */}
          <p className="text-gray-300 text-sm md:text-base font-light tracking-wide max-w-md leading-relaxed ml-0.5 mt-1">
            Ancient temples, island beaches, and vibrant city life — built for your crew.
          </p>

        </div>
      </div>
    </section>
  );
}