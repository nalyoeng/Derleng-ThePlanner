import React from 'react';
import { Heart, Star, MapPin } from 'lucide-react';

export default function DestinationCard({ d, fav, onToggleFav, onOpen }) {
  return (
    <div
      onClick={onOpen} // 🌟 Natively triggers opening the specific view/modal passing data up
      className="group rounded-3xl overflow-hidden bg-white border border-gray-100 flex flex-col cursor-pointer hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Header Section */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-900">
        <img 
          src={d.img} 
          alt={d.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Subtle dark gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Minimalist Category Badge */}
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#111827] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
          {d.category}
        </span>

        {/* Save / Favorite Button */}
        <button
          type="button"
          onClick={(e) => { 
            e.stopPropagation(); // 🌟 Prevents triggering onOpen layout logic when just saving
            onToggleFav(); 
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <Heart 
            size={14} 
            fill={fav ? "#0F5132" : "none"} 
            color={fav ? "#0F5132" : "#6B7280"} 
            className={fav ? "scale-110 transition-transform" : "transition-transform"}
          />
        </button>
      </div>

      {/* Card Content Section */}
      <div className="p-5 flex flex-col gap-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-lg text-[#111827] font-['Playfair_Display'] leading-tight truncate">
              {d.name}
            </h3>
            <span className="flex items-center gap-1 text-sm font-bold text-[#111827] bg-[#F9FAFB] border border-gray-100 px-2 py-0.5 rounded-md shrink-0">
              <Star size={13} fill="#E8B33D" color="#E8B33D" /> {d.rating}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
            <MapPin size={14} className="text-[#34D399]" /> 
            <span className="truncate">{d.location}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-50" />

        {/* Footer / Pricing */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            Est. Cost
          </span>
          <span className="font-bold text-sm text-[#0F5132] bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#34D399]/20">
            ${d.price} / day
          </span>
        </div>
      </div>
    </div>
  );
}