// components/FavoritesPage.jsx

import { useCallback, useEffect, useState } from 'react'
import {
  Clock,
  DollarSign,
  MapPin,
  Star,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { favoriteApi } from '../../lib/favoriteApi'

const CAT_COLOR = {
  Heritage: '#8B6B3D',
  Beach: '#2B7A8C',
  Nature: '#3D7A4F',
  City: '#6B5B95',
  Culture: '#A1473A',
  Adventure: '#9A5B32',
  Mountain: '#5F6F52',
  Other: '#64748B',
}

function formatSavedDate(dateValue) {
  if (!dateValue) {
    return 'recently'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'recently'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCategory(destination) {
  if (
    Array.isArray(destination?.categories) &&
    destination.categories.length > 0
  ) {
    return destination.categories[0]
  }

  return destination?.category || 'Other'
}

function getImage(destination) {
  return (
    destination?.image_url ||
    destination?.img ||
    'https://placehold.co/600x400?text=Destination'
  )
}

function getCost(destination) {
  const value =
    destination?.cost ?? destination?.price

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return value
  }

  return numberValue.toLocaleString()
}

function getRating(destination) {
  const value = Number(destination?.rating)

  if (Number.isNaN(value)) {
    return 'N/A'
  }

  return value.toFixed(1)
}

function FavoriteCard({
  favorite,
  onRemove,
  removing,
}) {
  const destination = favorite.destination
  const category = getCategory(destination)
  const image = getImage(destination)
  const cost = getCost(destination)

  const handleRemove = (event) => {
    // Prevent the Link from opening the destination page.
    event.preventDefault()
    event.stopPropagation()

    onRemove(destination.id)
  }

  return (
    <Link
      to={`/destination/${destination.id}`}
      className="group block"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ECE3D3] bg-[#F7F2E9] transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={destination.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <span
            className="absolute left-2 top-2 rounded-md px-2 py-1 text-[11px] font-semibold text-white"
            style={{
              background:
                CAT_COLOR[category] ||
                CAT_COLOR.Other,
            }}
          >
            {category}
          </span>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${destination.name} from favorites`}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E0533D] transition-colors hover:bg-[#c8442f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={14} color="white" />
          </button>

          <div className="absolute bottom-2 left-3 rounded-full bg-black/40 px-2 py-1 text-[11px] font-medium text-white">
            Saved {formatSavedDate(favorite.created_at)}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-sm font-semibold uppercase tracking-wide text-[#23231F]"
              style={{
                fontFamily:
                  "'Playfair Display', serif",
              }}
            >
              {destination.name}
            </h3>

            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FBE3D5] px-2 py-0.5 text-xs font-semibold text-[#DD6B3B]">
              <Star
                size={11}
                fill="#DD6B3B"
                color="#DD6B3B"
              />
              {getRating(destination)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#8A8276]">
            <MapPin size={12} />

            <span>
              {destination.location ||
                'Location unavailable'}
            </span>
          </div>

          {(destination.description ||
            destination.shortDesc) && (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#8A8276]">
              {destination.description ||
                destination.shortDesc}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-2 text-xs">
            {destination.days ? (
              <span className="flex items-center gap-1 text-[#8A8276]">
                <Clock size={12} />
                {destination.days}
              </span>
            ) : (
              <span />
            )}

            {cost !== null && (
              <span className="flex items-center gap-1 font-semibold text-[#DD6B3B]">
                <DollarSign size={11} />
                {cost}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] =
    useState(null)

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const result = await favoriteApi.getMine()

      setFavorites(
        Array.isArray(result?.data)
          ? result.data
          : []
      )
    } catch (requestError) {
      console.error(
        'Load favorites error:',
        requestError.response?.data ||
          requestError
      )

      setFavorites([])

      setError(
        requestError.response?.data?.message ||
          'Could not load favorites.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleRemove = async (
    destinationId
  ) => {
    const confirmed = window.confirm(
      'Remove this destination from your favorites?'
    )

    if (!confirmed) {
      return
    }

    try {
      setRemovingId(destinationId)
      setError('')

      await favoriteApi.remove(destinationId)

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (favorite) =>
            favorite.destination?.id !==
            destinationId
        )
      )
    } catch (requestError) {
      console.error(
        'Remove favorite error:',
        requestError.response?.data ||
          requestError
      )

      setError(
        requestError.response?.data?.message ||
          'Could not remove this favorite.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <span className="text-xs font-semibold tracking-widest text-[#DD6B3B]">
        YOUR COLLECTION
      </span>

      <h1
        className="mb-1 mt-1 text-3xl font-semibold text-[#23231F]"
        style={{
          fontFamily:
            "'Playfair Display', serif",
        }}
      >
        Favorites
      </h1>

      <p className="mb-6 text-sm text-[#8A8276]">
        Destinations saved to your collection
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#ECE3D3] py-20 text-center text-[#8A8276]">
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-[#ECE3D3] py-20 text-center text-[#8A8276]">
          <p className="font-medium">
            No favorites yet
          </p>

          <p className="mt-1 text-sm">
            Tap the heart on a destination to
            save it here.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-full bg-[#DD6B3B] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#c85a2f]"
          >
            Explore destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={
                favorite.destination_id ||
                favorite.destination?.id
              }
              favorite={favorite}
              onRemove={handleRemove}
              removing={
                removingId ===
                favorite.destination?.id
              }
            />
          ))}
        </div>
      )}
    </main>
  )
}