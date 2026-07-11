import React, { useState } from 'react';
import DestinationCard from './DestinationCard';
export default function ExploreView({ destinations }) {
  const [favorites, setFavorites] = useState({});

  const handleToggleFav = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#FBFBFA]">
      <h2 className="text-2xl font-bold text-[#111827] mb-6 font-serif tracking-wide uppercase">
        Explore Destinations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinations.map(dest => (
          <DestinationCard 
            key={dest.id}
            d={dest}
            fav={favorites[dest.id]}
            onToggleFav={() => handleToggleFav(dest.id)}
            // 🌟 The card internally handles navigation via <Link to={`/destination/${dest.id}`}> now!
          />
        ))}
      </div>
    </div>
  );
}