'use client'
import { useState, useEffect, useMemo } from 'react'
import { FieldConfig } from '@/types/config'
import { fetchApi } from '@/lib/api'

interface TableRendererProps {
  fields: FieldConfig[]
  apiBinding?: string
  token: string
}

type SortDirection = 'asc' | 'desc' | null

export default function TableRenderer({ fields, apiBinding, token }: TableRendererProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc')
      if (sortDirection === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? -1 : 1
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? 1 : -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = aVal.toString().toLowerCase()
      const bStr = bVal.toString().toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [data, sortField, sortDirection])

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (data.length === 0) return <div className="p-4 text-gray-500">No data available</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {fields.map(field => (
              <th 
                key={field.name} 
                className="p-2 text-left border cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort(field.name)}
              >
                {field.label}
                {sortField === field.name && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : ''}
                  </span>
                )}
              </th>
            ))}
            <th 
              className="p-2 text-left border cursor-pointer hover:bg-gray-200 select-none"
              onClick={() => handleSort('created_at')}
            >
              Created At
              {sortField === 'created_at' && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : ''}
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
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
