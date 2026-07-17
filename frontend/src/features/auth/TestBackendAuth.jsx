import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestBackendAuth() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session?.access_token) {
        setResult({
          success: false,
          message:
            'No login session found. Log in first.',
        })
        return
      }

      const response = await fetch(
        'http://localhost:5000/api/auth/me',
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      )

      const data = await response.json()

      setResult({
        httpStatus: response.status,
        ...data,
      })
    } catch (error) {
      setResult({
        success: false,
        message:
          error.message ||
          'Could not connect to the backend.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Backend Authentication Test
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          This checks whether Express can recognize your
          Supabase login.
        </p>

        <button
          type="button"
          onClick={runTest}
          disabled={loading}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? 'Testing...'
            : 'Test authentication'}
        </button>

        {result && (
          <pre className="mt-6 overflow-auto rounded-xl bg-gray-900 p-4 text-sm text-white">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}