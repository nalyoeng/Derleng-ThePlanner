import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useFavorites(userId, destinations = []) {
  const [favorites, setFavorites] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadFavorites = async () => {
      if (!userId) {
        setFavorites(new Set())
        setLoading(false)
        setError('')
        return
      }

      setLoading(true)
      setError('')

      const { data, error: queryError } =
        await supabase
          .from('favorites')
          .select('destination_id')
          .eq('user_id', userId)

      if (!active) return

      if (queryError) {
        console.error(
          'Favorite loading error:',
          queryError
        )
        setError(queryError.message)
        setLoading(false)
        return
      }

      setFavorites(
        new Set(
          (data || []).map((row) =>
            String(row.destination_id)
          )
        )
      )
      setLoading(false)
    }

    loadFavorites()

    return () => {
      active = false
    }
  }, [userId])

  const toggleFavorite = async (destinationId) => {
    if (!userId) return

    const id = String(destinationId)
    const wasFavorite = favorites.has(id)

    setError('')

    setFavorites((previous) => {
      const next = new Set(previous)

      if (wasFavorite) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })

    const result = wasFavorite
      ? await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('destination_id', Number(destinationId))
      : await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            destination_id: Number(destinationId),
          })

    if (!result.error) return

    console.error('Favorite update error:', result.error)
    setError(result.error.message)

    setFavorites((previous) => {
      const next = new Set(previous)

      if (wasFavorite) {
        next.add(id)
      } else {
        next.delete(id)
      }

      return next
    })
  }

  const favoriteDestinations = useMemo(() => {
    return destinations.filter((destination) =>
      favorites.has(String(destination.id))
    )
  }, [destinations, favorites])

  return {
    favorites,
    favoriteDestinations,
    loading,
    error,
    toggleFavorite,
  }
}
