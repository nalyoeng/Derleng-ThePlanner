import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import DestinationCard from './components/DestinationCard'
import DestinationModal from './components/destinationModel'

// Admin
import AdminLayout         from './features/admin/layout/AdminLayout';
import AdminDashboard      from './features/admin/AdminDashboard';
import PlaceManager        from './features/admin/PlaceManager';
import CreateAdmin         from './features/admin/CreateAdmin';
import { Backup, Recover } from './features/admin/BackupRecover';
import Report              from './features/admin/Report';

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

// Your friend's home page — kept exactly as is
function Home() {
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your friend's pages */}
        <Route path="/" element={<Home />} />

        {/* Your admin pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="destinations" element={<PlaceManager />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="backup"       element={<Backup />} />
          <Route path="recover"      element={<Recover />} />
          <Route path="report"       element={<Report />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;