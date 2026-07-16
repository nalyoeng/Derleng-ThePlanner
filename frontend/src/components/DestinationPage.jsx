import React, { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  DollarSign,
  Heart,
  Sunrise,
  MapPin,
} from 'lucide-react'

import ReviewSection from './ReviewSection'
import { destinationApi } from '../lib/destinationApi'

export default function DestinationPage({
  favorites = new Set(),
  onToggleFav = () => {},
  user,
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dest, setDest] = useState(null)
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDestination = async () => {
      try {
        setLoading(true)
        setError('')

        const result =
          await destinationApi.getById(id)

        // Backend response:
        // { success: true, data: destination }
        setDest(result?.data ?? result ?? null)
        setIdx(0)
      } catch (error) {
        console.error(
          'Load destination error:',
          error
        )

        setError(
          error.response?.data?.message ||
            'Could not load destination.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadDestination()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <p className="text-[#6B7280]">
          Loading destination...
        </p>
      </div>
    )
  }

  if (error || !dest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F9FAFB] text-[#6B7280]">
        <p>
          {error || 'No destination data found.'}
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-[#0F5132] underline"
        >
          Back to Explore
        </button>
      </div>
    )
  }

  const isFavorite =
    typeof favorites?.has === 'function'
      ? favorites.has(String(dest.id))
      : false

  const categories = Array.isArray(
    dest.categories
  )
    ? dest.categories
    : dest.category
      ? [dest.category]
      : []

  const images =
    Array.isArray(dest.images) &&
    dest.images.length > 0
      ? dest.images
      : dest.image_url
        ? [dest.image_url]
        : dest.img
          ? [dest.img]
          : [
              'https://placehold.co/1200x700?text=Destination',
            ]

  const cost = dest.cost ?? dest.price ?? 0

  const reviewCount =
    dest.review_count ??
    dest.reviews_count ??
    dest.reviews ??
    0

  const rating = Number(dest.rating ?? 0)

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#111827] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-100 bg-white px-4 py-4 shadow-sm md:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-semibold text-[#6B7280] transition-colors hover:text-[#0F5132]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          <span>Back to Explore</span>
        </button>

        <h1 className="hidden font-serif text-lg font-bold text-[#111827] md:block">
          {dest.name}
        </h1>

        <button
          type="button"
          onClick={() => onToggleFav(dest.id)}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            isFavorite
              ? 'border-[#34D399] bg-[#F0FDF4] text-[#0F5132]'
              : 'border-gray-200 bg-white text-[#111827] hover:border-gray-300'
          }`}
        >
          <Heart
            size={14}
            fill={
              isFavorite ? '#0F5132' : 'none'
            }
            color={
              isFavorite ? '#0F5132' : '#111827'
            }
          />

          <span>
            {isFavorite ? 'Saved' : 'Save to Trips'}
          </span>
        </button>
      </header>

      {/* Main layout */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-6 md:py-10 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Main image */}
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="relative h-64 w-full bg-gray-900 sm:h-96">
              <img
                src={images[idx]}
                alt={dest.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    'https://placehold.co/1200x700?text=Destination'
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="mb-1 inline-block text-xs font-bold uppercase tracking-wider text-[#34D399]">
                  {categories.join(' · ') ||
                    'Destination'}{' '}
                  · {dest.location}
                </span>

                <h2 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  {dest.name}
                </h2>
              </div>
            </div>

            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-gray-50 bg-white p-4">
                {images.map((image, imageIndex) => (
                  <button
                    key={`${image}-${imageIndex}`}
                    type="button"
                    onClick={() =>
                      setIdx(imageIndex)
                    }
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      imageIndex === idx
                        ? 'scale-95 border-[#0F5132] shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${dest.name} ${
                        imageIndex + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination details */}
          <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Star
                    size={16}
                    fill="#E8B33D"
                    color="#E8B33D"
                  />

                  <span>{rating.toFixed(1)}</span>

                  <span className="font-medium text-[#6B7280]">
                    (
                    {reviewCount >= 1000
                      ? `${(
                          reviewCount / 1000
                        ).toFixed(1)}K`
                      : reviewCount}{' '}
                    reviews)
                  </span>
                </span>

                <span className="flex items-center gap-1 font-bold text-[#0F5132]">
                  <DollarSign size={15} />

                  <span>${cost} / day</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#0F5132]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {dest.highlight && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#34D399]/20 bg-[#F0FDF4] px-4 py-3 text-sm font-semibold text-[#0F5132]">
                <Sunrise
                  size={18}
                  className="text-[#34D399]"
                />

                <span>{dest.highlight}</span>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                About destination
              </h3>

              <p className="text-sm font-normal leading-relaxed text-[#111827] md:text-base">
                {dest.description ||
                  'No description is available for this destination.'}
              </p>
            </div>
          </div>

          {/* Reviews from Express backend */}
          <ReviewSection
            destinationId={dest.id}
            user={user}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Geographic Location
            </h3>

            <div className="relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#F0FDF4]/30 px-4 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#34D399]/20 bg-[#F0FDF4]">
                <MapPin
                  size={20}
                  className="text-[#0F5132]"
                />
              </div>

              <span className="text-xs font-bold leading-snug text-[#0F5132]">
                {dest.mapLabel || dest.location}
              </span>

              <span className="mt-0.5 text-[11px] text-[#6B7280]">
                {dest.location}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}