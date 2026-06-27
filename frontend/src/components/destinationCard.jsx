// components/DestinationCard.jsx
import React from 'react';
import { Heart, Star, MapPin } from 'lucide-react';

const CAT_COLOR = {
  Heritage: "#8B6B3D",
  Beach: "#2B7A8C",
  Nature: "#3D7A4F",
  City: "#6B5B95",
  Culture: "#A1473A",
};

export default function DestinationCard({ d, fav, onToggleFav, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="rounded-2xl overflow-hidden bg-white border flex flex-col cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="relative h-40">
        <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
        <span
          className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-md text-white"
          style={{ background: CAT_COLOR[d.category] }}
        >
          {d.category}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
        >
          <Heart size={14} fill={fav ? "#DD6B3B" : "none"} color={fav ? "#DD6B3B" : "#999"} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{d.name}</h3>
          <span className="flex items-center gap-1 text-sm font-medium">
            <Star size={13} fill="#E8B33D" color="#E8B33D" /> {d.rating}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={13} /> {d.location}
        </div>
        <span className="font-semibold text-sm text-emerald-800">${d.price}/day</span>
      </div>
    </div>
  );
}