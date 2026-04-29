'use client'
import { useState, useEffect } from 'react'
import { FieldConfig } from '@/types/config'
import { fetchApi } from '@/lib/api'

interface TableRendererProps {
  fields: FieldConfig[]
  apiBinding?: string
  token: string
}

export default function TableRenderer({ fields, apiBinding, token }: TableRendererProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiBinding) {
      setError('No API binding configured')
      setLoading(false)
      return
    }
    loadData()
  }, [apiBinding])

  const loadData = async () => {
    if (!apiBinding) return
    try {
      const result = await fetchApi(apiBinding, token)
      setData(Array.isArray(result) ? result : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (data.length === 0) return <div className="p-4 text-gray-500">No data available</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {fields.map(field => (
              <th key={field.name} className="p-2 text-left border">
                {field.label}
              </th>
            ))}
            <th className="p-2 text-left border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50">
              {fields.map(field => (
                <td key={field.name} className="p-2 border">
                  {row[field.name]?.toString() || '-'}
                </td>
              ))}
              <td className="p-2 border">{row.created_at || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
