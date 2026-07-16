import axios from 'axios'
import { supabase } from './supabaseClient'

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return Promise.reject(error)
    }

    if (session?.access_token) {
      config.headers.Authorization =
        `Bearer ${session.access_token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient