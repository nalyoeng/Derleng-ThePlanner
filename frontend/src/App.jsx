import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import DestinationCard from './components/DestinationCard'      // the actual card
import DestinationModal from './components/destinationModel'    // the popup

const destinations = [
  {
    id: 1,
    name: "Angkor Wat",
    category: "Heritage",
    location: "Siem Reap",
    rating: 4.9,
    reviews: 982,
    price: 37,
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    images: ["https://...1.jpg", "https://...2.jpg"],
    highlight: "Best sunrise in South Asia",
    description: "The world's largest religious monument...",
    tags: ["Temples", "Sunrise", "Heritage"],
    mapLabel: "Angkor Wat, Siem Reap, Cambodia",
  },
];

function App() {
  const [favorites, setFavorites] = useState(new Set());
  const [activeDest, setActiveDest] = useState(null);

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <Header />
      <FirstCard />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 py-4">
        {destinations.map((d) => (
          <DestinationCard
            key={d.id}
            d={d}
            fav={favorites.has(d.id)}
            onToggleFav={() => toggleFav(d.id)}
            onOpen={() => setActiveDest(d)}
          />
        ))}
      </section>

      {activeDest && (
        <DestinationModal
          dest={activeDest}
          onClose={() => setActiveDest(null)}
          fav={favorites.has(activeDest.id)}
          onToggleFav={() => toggleFav(activeDest.id)}
        />
      )}
    </div>
  )
}

export default App