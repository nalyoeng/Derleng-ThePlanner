import { useEffect, useMemo, useState } from 'react'

import Header from '../../components/Header'
import FirstCard from '../../components/FirstCard'
import DestinationCard from '../../components/DestinationCard'
import { destinationApi } from '../../lib/destinationApi'

export default function Home({
  user,
  onLogout,
  favorites = new Set(),
  onToggleFav = () => {},
  favoritesLoading = false,
  favoritesError = '',
}) {
  const [destinations, setDestinations] = useState([])
  const [destinationsLoading, setDestinationsLoading] =
    useState(true)
  const [destinationsError, setDestinationsError] =
    useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] =
    useState([])

  // Load destinations from Express backend
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setDestinationsLoading(true)
        setDestinationsError('')

        const response = await destinationApi.getAll({
          page: 1,
          limit: 100,
          status: 'Active',
        })

        setDestinations(response.data ?? [])
      } catch (error) {
        console.error('Load destinations error:', error)

        setDestinationsError(
          error.response?.data?.message ||
            'Could not load destinations.'
        )
      } finally {
        setDestinationsLoading(false)
      }
    }

    loadDestinations()
  }, [])

  // Get every unique category from categories[]
  const categories = useMemo(() => {
    const allCategories = destinations.flatMap(
      (destination) => {
        if (Array.isArray(destination.categories)) {
          return destination.categories
        }

        // Support old frontend data temporarily
        if (destination.category) {
          return [destination.category]
        }

        return []
      }
    )

    return [
      ...new Set(
        allCategories
          .map((category) => category?.trim())
          .filter(Boolean)
      ),
    ].sort()
  }, [destinations])

  const filteredDestinations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return destinations.filter((destination) => {
      const destinationCategories = Array.isArray(
        destination.categories
      )
        ? destination.categories
        : destination.category
          ? [destination.category]
          : []

      const searchText = [
        destination.name,
        destination.location,
        destination.description,
        destination.highlight,
        ...destinationCategories,
        ...(destination.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !search || searchText.includes(search)

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          destinationCategories.includes(category)
        )

      return matchesSearch && matchesCategory
    })
  }, [
    destinations,
    searchTerm,
    selectedCategories,
  ])

  const toggleCategory = (category) => {
    setSelectedCategories((previous) => {
      if (previous.includes(category)) {
        return previous.filter(
          (item) => item !== category
        )
      }

      return [...previous, category]
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
  }

  return (
    <div>
      <Header
        user={user}
        onLogout={onLogout}
        showSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        destinations={destinations}
      />

      <FirstCard destinations={destinations} />

      <section className="px-6 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Find your type of place
              </h2>

              <p className="text-sm text-gray-500">
                Choose one or more categories
              </p>
            </div>

            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#0F5132] hover:underline"
              >
                Clear categories
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const checked =
                selectedCategories.includes(category)

              return (
                <label
                  key={category}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 transition-all ${
                    checked
                      ? 'border-[#8FCBB3] bg-[#D2EBE1] text-[#1E4620]'
                      : 'border-[#E1DDD4] bg-white text-gray-700 hover:border-[#8FCBB3]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleCategory(category)
                    }
                    className="accent-[#0F5132]"
                  />

                  <span className="text-sm font-medium">
                    {category}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinationsLoading && (
          <p className="text-sm text-gray-500 sm:col-span-2 lg:col-span-3">
            Loading destinations...
          </p>
        )}

        {destinationsError && (
          <div className="rounded-lg bg-red-50 p-3 text-red-600 sm:col-span-2 lg:col-span-3">
            {destinationsError}
          </div>
        )}

        {favoritesError && (
          <div className="rounded-lg bg-red-50 p-3 text-red-600 sm:col-span-2 lg:col-span-3">
            Could not update favorites: {favoritesError}
          </div>
        )}

        {favoritesLoading && (
          <p className="text-sm text-gray-500 sm:col-span-2 lg:col-span-3">
            Loading favorites...
          </p>
        )}

        {!destinationsLoading &&
        !destinationsError &&
        filteredDestinations.length === 0 ? (
          <div className="py-16 text-center sm:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold">
              No destinations found
            </h2>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-[#0F5132] px-5 py-2 text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              d={destination}
              fav={favorites.has(
                String(destination.id)
              )}
              onToggleFav={() =>
                onToggleFav(destination.id)
              }
            />
          ))
        )}
      </section>
    </div>
  )
}