'use client'
import { useState, useEffect } from 'react'
import FormRenderer from './renderers/FormRenderer'
import TableRenderer from './renderers/TableRenderer'
import DashboardRenderer from './renderers/DashboardRenderer'
import { fetchConfigs, fetchApi } from '@/lib/api'
import { Config } from '@/types/config'

interface AppRendererProps {
  token: string
}

export default function AppRenderer({ token }: AppRendererProps) {
  const [configs, setConfigs] = useState<Config[]>([])
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadConfigs()
  }, [token])

  useEffect(() => {
    if (refreshKey > 0) {
      loadConfigs()
    }
  }, [refreshKey])

  const loadConfigs = async () => {
    try {
      const data = await fetchConfigs(token)
      setConfigs(data)
      if (data.length > 0 && !selectedConfig) {
        setSelectedConfig(data[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
  }

  const activeConfig = configs.find(c => c.id === selectedConfig)

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (configs.length === 0) {
    return <div className="p-8 text-gray-500">No configs found. Upload a config first.</div>
  }

  return (
    <div>
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={selectedConfig || ''}
          onChange={e => setSelectedConfig(e.target.value)}
          className="p-2 border rounded"
        >
          {configs.map(config => (
            <option key={config.id} value={config.id}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {activeConfig && activeConfig.app && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">{activeConfig.app.name}</h2>
          {activeConfig.app.description && (
            <p className="text-gray-600">{activeConfig.app.description}</p>
          )}

          {activeConfig.ui.map((component: any) => {
            if (component.type === 'form' && component.fields) {
              return (
                <div key={component.id} className="p-6 border rounded-lg bg-white">
                  <h3 className="text-xl font-semibold mb-4">{component.title}</h3>
                  <FormRenderer
                    fields={component.fields}
                    apiBinding={component.api_binding}
                    token={token}
                    onSuccess={handleRefresh}
                  />
                </div>
              )
            }

            if (component.type === 'table' && component.fields) {
              return (
                <div key={component.id} className="p-6 border rounded-lg bg-white">
                  <h3 className="text-xl font-semibold mb-4">{component.title}</h3>
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
                  <h3 className="text-xl font-semibold mb-4">{component.title}</h3>
                  <DashboardRenderer components={activeConfig.ui} token={token} />
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
      )}
    </div>
  )
}
