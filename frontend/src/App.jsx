import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import DestinationCard from './components/DestinationCard'
import DestinationModal from './components/destinationModel'
import FavoritesPage from './features/favorite'
import AboutPage from './features/about'
import ProfilePage from './features/profile'
import AuthPage from './features/auth'
import { supabase } from './lib/supabaseClient'
const destinations = [
  {
    id: 1,
    name: "Angkor Wat",
    category: "Heritage",
    location: "Siem Reap",
    rating: 4.9,
    reviews: 982,
    price: 37,
    days: "2-4 days",
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    images: ["https://...1.jpg", "https://...2.jpg"],
    highlight: "Best sunrise in South Asia",
    description: "The world's largest religious monument...",
    tags: ["Temples", "Sunrise", "Heritage"],
    mapLabel: "Angkor Wat, Siem Reap, Cambodia",
  },
];

function App() {
  const [user,setUser]= useState(null);
  const [loading,setLoading]= useState(true);
  const [page, setPage] = useState('home'); // 'home' | 'favorites' | 'about' | 'profile'
  const [profileView, setProfileView] = useState('overview');
  const [favorites, setFavorites] = useState(new Set());
  const [activeDest, setActiveDest] = useState(null);
  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};
  useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data }) => {
    if (mounted) {
      setUser(data.session?.user || null);
      setLoading(false);
    }
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null);
    setLoading(false);
  });

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
}, []);
  const favoriteDestinations = destinations.filter((d) => favorites.has(d.id));
  if(loading){
    return <div>Loading...</div>;
  }
  if(!user) {
    return <AuthPage/>
  }
  return (
    <div>
      <Header page={page} setPage={setPage} setProfileView={setProfileView} onLogout={handleLogout} />
      {page === 'home' && (
        <>
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
        </>
      )}

      {page === 'favorites' && (
        <FavoritesPage favorites={favoriteDestinations} onRemove={toggleFav} />
      )}

      {page === 'about' && <AboutPage />}

     {page === 'profile' && (<ProfilePage user={user} activeTab={profileView} onTabChange={setProfileView} onLogout={handleLogout} />)}
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