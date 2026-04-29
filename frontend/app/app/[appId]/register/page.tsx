'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import FormRenderer from '@/components/renderers/FormRenderer'
import TableRenderer from '@/components/renderers/TableRenderer'
import DashboardRenderer from '@/components/renderers/DashboardRenderer'
import { fetchApi } from '@/lib/api'
import { Config } from '@/types/config'

export default function AppPage() {
  const params = useParams()
  const appId = params.appId as string
  const [token, setToken] = useState<string | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      loadConfig(savedToken)
    } else {
      setLoading(false)
    }
  }, [appId])

  const loadConfig = async (authToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configs/${appId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error('Failed to load config')
      const data = await res.json()
      setConfig(JSON.parse(data.config_json))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Please login first</p>
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
