'use client'
import { useState, useEffect } from 'react'
import { login, register, fetchConfigs, createConfig } from '@/lib/api'
import ConfigUpload from '@/components/ConfigUpload'
import AppRenderer from '@/components/AppRenderer'

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [configJson, setConfigJson] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) setToken(savedToken)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = isLogin 
        ? await login(email, password)
        : await register(email, password)
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    }
  }

  const handleConfigMount = async () => {
    if (!token || !configJson) return
    try {
      await createConfig('My App', configJson, token)
      alert('Config saved!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">
            {isLogin ? 'Login' : 'Register'}
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
          <p className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">App Generator</h1>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              setToken(null)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
        <ConfigUpload
          token={token}
          configJson={configJson}
          setConfigJson={setConfigJson}
          onMount={handleConfigMount}
        />
        <AppRenderer token={token} />
      </div>
    </main>
  )
}
