import React, { useState } from 'react';
import DestinationCard from './DestinationCard';
import DestinationPage from './DestinationPage';

export default function ExploreView({ destinations }) {
  const [selectedDest, setSelectedDest] = useState(null);
  const [favorites, setFavorites] = useState({});

  const handleToggleFav = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. If a destination is selected, render the Full Page Component
  if (selectedDest) {
    return (
      <DestinationPage 
        dest={selectedDest} 
        onBack={() => setSelectedDest(null)} 
        fav={favorites[selectedDest.id]}
        onToggleFav={() => handleToggleFav(selectedDest.id)}
      />
    );
  }

  // 2. Otherwise, render the grid of Minimalist Cards
  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#F9FAFB]">
      <h2 className="text-2xl font-bold text-[#111827] mb-6 font-['Playfair_Display']">
        Explore Destinations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinations.map(dest => (
          <DestinationCard 
            key={dest.id}
            d={dest}
            fav={favorites[dest.id]}
            onToggleFav={() => handleToggleFav(dest.id)}
            onOpen={() => setSelectedDest(dest)}
          />
        ))}
      </div>
    </div>
  );
}