import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const {
        data,
        error: sessionError,
      } = await supabase.auth.getSession()

      if (!active) return

      if (sessionError) {
        setError(sessionError.message)
        setLoading(false)
        return
      }

      setUser(data.session?.user || null)
    }

    loadSession()

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!active) return

          setUser(session?.user || null)
        }
      )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadRole = async () => {
      if (!user?.id) {
        setRole('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const {
        data,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!active) return

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      setRole(
        String(data?.role || 'user')
          .trim()
          .toLowerCase()
      )

      setLoading(false)
    }

    loadRole()

    return () => {
      active = false
    }
  }, [user?.id])

  const logout = async () => {
    const {
      error: logoutError,
    } = await supabase.auth.signOut()

    if (logoutError) {
      setError(logoutError.message)
      return
    }

    setUser(null)
    setRole('')
  }

  return {
    user,
    role,
    loading,
    error,
    logout,
  }
}