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
function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())

  //get destination
  const [destinations, setDestinations] = useState([])
  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [destinationsError, setDestinationsError] = useState('')

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
  // Load destinations from Supabase
  useEffect(() => {
  const loadDestinations = async () => {
    setDestinationsLoading(true)
    setDestinationsError('')

    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Destination error:', error)
      setDestinationsError(error.message)
      setDestinations([])
      setDestinationsLoading(false)
      return
    }

    const formattedDestinations = (data || []).map((destination) => ({
      id: destination.id,
      name: destination.name,
      category: destination.category,
      location: destination.location,

      rating: destination.rating || 0,

      reviews:
        destination.reviews_count ||
        destination.review_count ||
        0,

      price: destination.price || 0,
      days: destination.days || '',

      img:
        destination.img ||
        destination.image_url ||
        '',

      images: destination.images || [],

      highlight: destination.highlight || '',
      description: destination.description || '',
      tags: destination.tags || [],

      mapLabel:
        destination.map_label ||
        destination.mapLabel ||
        destination.location ||
        '',
    }))

    setDestinations(formattedDestinations)
    setDestinationsLoading(false)
  }

  loadDestinations()
}, [])

  const favoriteDestinations = destinations.filter((d) => favorites.has(d.id))

  if (loading || destinationsLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!user) return <AuthPage />
  if (destinationsError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3">
        <p className="text-red-600">
          Failed to load destinations.
        </p>

        <p className="text-sm text-gray-500">
          {destinationsError}
        </p>
      </div>
    )
  }
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
                user={user}
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