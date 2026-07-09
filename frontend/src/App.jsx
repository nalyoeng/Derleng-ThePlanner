import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import DestinationCard from './components/DestinationCard'
import FavoritesPage from './features/favorite'
import AboutPage from './features/about'
import ProfilePage from './features/profile'
import AuthPage from './features/auth'
import { supabase } from './lib/supabaseClient'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin
import AdminLayout from './features/admin/layout/AdminLayout'
import AdminDashboard from './features/admin/AdminDashboard'
import PlaceManager from './features/admin/PlaceManager'
import CreateAdmin from './features/admin/CreateAdmin'
import { Backup, Recover } from './features/admin/BackupRecover'
import Report from './features/admin/Report'

// Components
import DestinationPage from './components/DestinationPage'
import ChatPage from './components/chatting/Chatpage'

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
    days: "2-4 days",
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523",
      "https://images.unsplash.com/photo-1580993072224-b1f4139bdca0"
    ],
    highlight: "Best sunrise in South Asia",
    description: "The world's largest religious monument...",
    tags: ["Temples", "Sunrise", "Heritage"],
    mapLabel: "Angkor Wat, Siem Reap, Cambodia",
  },
]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user || null)
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const favoriteDestinations = destinations.filter((d) => favorites.has(d.id))

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!user) return <AuthPage />

  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <div>
              {/* 🌟 FIXED: Passed the authenticated user profile object */}
              <Header user={user} onLogout={handleLogout} />
              <FirstCard />

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-6 py-4">
                {destinations.map((d) => (
                  <DestinationCard
                    key={d.id}
                    d={d}
                    fav={favorites.has(d.id)}
                    onToggleFav={() => toggleFav(d.id)}
                  />
                ))}
              </section>
            </div>
          }
        />

        {/* Favorites */}
        <Route
          path="/favorites"
          element={
            <div>
              <Header user={user} onLogout={handleLogout} />
              <FavoritesPage
                favorites={favoriteDestinations}
                onRemove={toggleFav}
              />
            </div>
          }
        />

        {/* About */}
        <Route 
          path="/about" 
          element={
            <div>
              <Header user={user} onLogout={handleLogout} />
              <AboutPage />
            </div>
          } 
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <div>
              <Header user={user} onLogout={handleLogout} />
              <ProfilePage
                user={user}
                onLogout={handleLogout}
              />
            </div>
          }
        />

        {/* Destination detail */}
        <Route
          path="/destination/:id"
          element={
            <div>
              <Header user={user} onLogout={handleLogout} />
              <DestinationPage
                destinationsList={destinations}
                favorites={favorites}
                onToggleFav={toggleFav}
              />
            </div>
          }
        />

        {/* Chat */}
        <Route 
          path="/chat" 
          element={
            <div>
              <Header user={user} onLogout={handleLogout} />
              <ChatPage />
            </div>
          } 
        />

        {/* Admin Layout and sub-routes (Header isn't loaded here intentionally) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="destinations" element={<PlaceManager />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="backup" element={<Backup />} />
          <Route path="recover" element={<Recover />} />
          <Route path="report" element={<Report />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App