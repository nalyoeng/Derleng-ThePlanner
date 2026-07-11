import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function normalizeList(value) {
  if (Array.isArray(value)) return value

  if (typeof value !== 'string' || !value.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // The value is plain comma-separated text.
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function useDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDestinations = async () => {
      setLoading(true)
      setError('')

      const { data, error: queryError } =
        await supabase
          .from('destinations')
          .select('*')

      if (!active) return

      if (queryError) {
        console.error(
          'Destination loading error:',
          queryError
        )
        setDestinations([])
        setError(queryError.message)
        setLoading(false)
        return
      }

      const formatted = (data || [])
        .map((destination) => ({
          ...destination,
          id: destination.id,
          name: destination.name || '',
          category: destination.category || '',
          location: destination.location || '',
          rating: Number(destination.rating || 0),
          reviews: Number(
            destination.reviews_count ??
              destination.review_count ??
              destination.reviews ??
              0
          ),
          price: destination.price || 0,
          days: destination.days || '',
          img:
            destination.img ||
            destination.image_url ||
            '',
          image_url:
            destination.image_url ||
            destination.img ||
            '',
          images: normalizeList(destination.images),
          highlight: destination.highlight || '',
          description: destination.description || '',
          tags: normalizeList(destination.tags),
          mapLabel:
            destination.map_label ||
            destination.mapLabel ||
            destination.location ||
            '',
        }))
        .sort((first, second) => {
          if (!first.created_at || !second.created_at) {
            return 0
          }

          return (
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime()
          )
        })

      setDestinations(formatted)
      setLoading(false)
    }

    loadDestinations()

    return () => {
      active = false
    }
  }, [])

  return {
    destinations,
    loading,
    error,
  }
}
