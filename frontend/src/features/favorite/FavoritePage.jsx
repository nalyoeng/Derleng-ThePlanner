// components/FavoritesPage.jsx
import React from 'react';
import { Star, MapPin, Clock, DollarSign, Trash2 } from 'lucide-react';
import {Link} from 'react-router-dom';
const CAT_COLOR = {
  Heritage: "#8B6B3D",
  Beach: "#2B7A8C",
  Nature: "#3D7A4F",
  City: "#6B5B95",
  Culture: "#A1473A",
};

function FavoriteCard({ d, onRemove }) {
  const handleRemove= (event)=> {
    // stop the card from opening the detail page.
    event.preventDefault();
    event.stopPropagation();
    onRemove(d.id);
  }
  return (
    <Link to={`/destination/${d.id}`} className="group">
    <div className="rounded-2xl overflow-hidden bg-[#F7F2E9] border border-[#ECE3D3] flex flex-col">
      <div className="relative h-40">
        <img src={d.img} alt={d.name} className="w-full h-full object-cover" />

        <span
          className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-md text-white"
          style={{ background: CAT_COLOR[d.category] }}
        >
          {d.category}
        </span>

        <button
          onClick={() => onRemove(d.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#E0533D] flex items-center justify-center hover:bg-[#c8442f] transition-colors"
        >
          <Trash2 size={13} color="white" />
        </button>

        <div className="absolute bottom-2 left-3 text-[11px] text-white/85 font-medium">
          Saved {d.savedDate}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3
            className="font-semibold text-sm uppercase tracking-wide text-[#23231F]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {d.name}
          </h3>
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FBE3D5] text-[#DD6B3B]">
            <Star size={11} fill="#DD6B3B" color="#DD6B3B" /> {d.rating}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#8A8276]">
          <MapPin size={12} /> {d.location}
        </div>

        {d.shortDesc && (
          <p className="text-xs text-[#8A8276] leading-relaxed">{d.shortDesc}</p>
        )}

        <div className="flex items-center justify-between mt-1.5 text-xs">
          <span className="flex items-center gap-1 text-[#8A8276]">
            <Clock size={12} /> {d.days}
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#DD6B3B]">
            <DollarSign size={11} /> {d.price}/day
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
}

export default function FavoritesPage({ favorites, onRemove }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <span className="text-xs tracking-widest font-semibold text-[#DD6B3B]">
        YOUR COLLECTION
      </span>
      <h1
        className="text-3xl font-semibold mt-1 mb-1 text-[#23231F]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Favorites
      </h1>
      <p className="text-sm text-[#8A8276] mb-6">
        Destinations saved to your collection
      </p>

      {favorites.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-[#ECE3D3] text-[#8A8276]">
          No favorites yet — tap the heart on a destination to save it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((d) => (
            <FavoriteCard key={d.id} d={d} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}