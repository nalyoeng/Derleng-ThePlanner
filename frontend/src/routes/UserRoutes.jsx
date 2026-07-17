import { Navigate, Route, Routes} from 'react-router-dom'
import Header from '../components/Header'
import DestinationPage from '../components/DestinationPage'
import ChatPage from '../components/chatting/Chatpage'

import Home from '../features/home/Home'
import FavoritesPage from '../features/favorite'
import AboutPage from '../features/about'
import ProfilePage from '../features/profile'

import { useDestinations } from '../hooks/useDestinations'
import { useFavorites } from '../hooks/useFavorites'
import TestBackendAuth from '../features/auth/TestBackendAuth'

export default function UserRoutes({ user, onLogout }) {
  const {
    destinations,
    loading: destinationsLoading,
    error: destinationsError,
  } = useDestinations()

  const {
    favorites,
    favoriteDestinations,
    loading: favoritesLoading,
    error: favoritesError,
    toggleFavorite,
  } = useFavorites(user?.id, destinations)

  if (destinationsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading destinations...
      </div>
    )
  }

  if (destinationsError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-semibold text-red-600">
          Failed to load destinations.
        </p>

        <p className="text-sm text-gray-500">
          {destinationsError}
        </p>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            user={user}
            onLogout={onLogout}
            destinations={destinations}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            favoritesLoading={favoritesLoading}
            favoritesError={favoritesError}
          />
        }
      />
      <Route
        path="/test-auth"
        element={<TestBackendAuth />}
      />

      <Route
        path="/favorites"
        element={
          <>
            <Header
              user={user}
              onLogout={onLogout}
            />

            <FavoritesPage
              favorites={favoriteDestinations}
              onRemove={toggleFavorite}
            />
          </>
        }
      />

      <Route
        path="/about"
        element={
          <>
            <Header
              user={user}
              onLogout={onLogout}
            />

            <AboutPage />
          </>
        }
      />

      <Route
        path="/profile"
        element={
          <>
            <Header
              user={user}
              onLogout={onLogout}
            />

            <ProfilePage
              user={user}
              onLogout={onLogout}
            />
          </>
        }
      />

      <Route
        path="/destination/:id"
        element={
          <>
            <Header
              user={user}
              onLogout={onLogout}
            />

            <DestinationPage
              user={user}
              destinationsList={destinations}
              favorites={favorites}
              onToggleFav={toggleFavorite}
            />
          </>
        }
      />

      <Route
        path="/chat"
        element={
          <>
            <Header
              user={user}
              onLogout={onLogout}
            />
            <ChatPage />
          </>
        }
      />

      <Route path="/chat/:groupId" element={<>
            <Header
              user={user}
              onLogout={onLogout}
            />
            <ChatPage />
          </>} 
      />

      <Route path="/chat/:groupId/days" element={
        <>
          <Header user={user} onLogout={onLogout} />
          <ChatPage />
        </>
      } />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}