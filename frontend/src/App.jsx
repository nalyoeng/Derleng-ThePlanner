import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import ChatPage from './components/chatting/Chatpage'
import DestinationCard from './components/DestinationCard'
import DestinationPage from './components/DestinationPage' // Named match updated

// Admin
import AdminLayout         from './features/admin/layout/AdminLayout';
import AdminDashboard      from './features/admin/AdminDashboard';
import PlaceManager        from './features/admin/PlaceManager';
import CreateAdmin         from './features/admin/CreateAdmin';
import { Backup, Recover } from './features/admin/BackupRecover';
import Report              from './features/admin/Report';

// Global Data Array
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
    images: ["https://images.unsplash.com/photo-1564507592333-c60657eea523", "https://images.unsplash.com/photo-1580993072224-b1f4139bdca0"],
    highlight: "Best sunrise in South Asia",
    description: "The world's largest religious monument...",
    tags: ["Temples", "Sunrise", "Heritage"],
    mapLabel: "Angkor Wat, Siem Reap, Cambodia",
  },
];

// Refactored Home View Panel using dynamic routing links
function Home({ favorites, toggleFav }) {
  const [activeDest, setActiveDest] = useState(null);

  // If a destination has been opened, render the page block natively
  if (activeDest) {
    return (
      <DestinationPage 
        dest={activeDest} 
        onBack={() => setActiveDest(null)} 
        fav={favorites.has(activeDest.id)}
        onToggleFav={() => toggleFav(activeDest.id)}
      />
    );
  }

  return (
    <div>
      <Header />
      <FirstCard />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 py-4 bg-[#F9FAFB]">
        {destinations.map((d) => (
          <DestinationCard
            key={d.id}
            d={d}
            fav={favorites.has(d.id)}
            onToggleFav={() => toggleFav(d.id)}
            onOpen={() => setActiveDest(d)} // 🌟 Set target item hook
          />
        ))}
      </section>
    </div>
  );
}

function App() {
  // Shared state lifted up to pass down tracking variables natively across views
  const [favorites, setFavorites] = useState(new Set());

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <BrowserRouter>
      <Routes>
        {/* Gallery Interface */}
        <Route 
          path="/" 
          element={<Home favorites={favorites} toggleFav={toggleFav} />} 
        />
        
        {/* Standalone routed sub-page view layout */}
        <Route 
          path="/destination/:id" 
          element={
            <DestinationPage 
              destinationsList={destinations} 
              favorites={favorites} 
              onToggleFav={toggleFav} 
            />
          } 
        />
        
        <Route path="/chat" element={<ChatPage/>} />

        {/* Admin Section Layout Ecosystem */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="destinations" element={<PlaceManager />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="backup"       element={<Backup />} />
          <Route path="recover"      element={<Recover />} />
          <Route path="report"       element={<Report />} />
        </Route>

        {/* Fallback Catch */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;