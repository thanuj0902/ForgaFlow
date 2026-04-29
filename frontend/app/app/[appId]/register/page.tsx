'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as string
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      if (!res.ok) throw new Error('Registration failed')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      router.push(`/app/${appId}`)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href={`/app/${appId}/login`} className="text-blue-600 hover:text-blue-500">
            Already have an account? Login
          </a>
        </div>
      </div>
    </main>
  )
}

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!config) return <div className="p-8 text-gray-500">Config not found</div>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{config.app.name}</h1>
        {config.app.description && (
          <p className="text-gray-600 mb-8">{config.app.description}</p>
        )}

        <div className="space-y-8">
          {config.ui.map((component) => {
            if (component.type === 'form' && component.fields) {
              return (
                <div key={component.id} className="p-6 border rounded-lg bg-white">
                  <h2 className="text-xl font-semibold mb-4">{component.title}</h2>
                  <FormRenderer
                    fields={component.fields}
                    apiBinding={component.api_binding}
                    token={token}
                  />
                </div>
              )
            }

            if (component.type === 'table' && component.fields) {
              return (
                <div key={component.id} className="p-6 border rounded-lg bg-white">
                  <h2 className="text-xl font-semibold mb-4">{component.title}</h2>
                  <TableRenderer
                    fields={component.fields}
                    apiBinding={component.api_binding}
                    token={token}
                  />
                </div>
              )
            }

            if (component.type === 'dashboard') {
              return (
                <div key={component.id}>
                  <h2 className="text-xl font-semibold mb-4">{component.title}</h2>
                  <DashboardRenderer components={config.ui} token={token} />
                </div>
              )
            }

            return (
              <div key={component.id} className="p-4 border rounded bg-red-50">
                <p className="text-red-500">Unknown component type: {component.type}</p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
