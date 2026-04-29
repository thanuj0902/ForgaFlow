'use client'
import { useState } from 'react'
import { FieldConfig } from '@/types/config'
import { fetchApi } from '@/lib/api'

interface FormRendererProps {
  fields: FieldConfig[]
  apiBinding?: string
  token: string
  onSuccess?: () => void
}

export default function FormRenderer({ fields, apiBinding, token, onSuccess }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiBinding) {
      setError('No API binding configured')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await fetchApi(apiBinding, token, {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setSuccess(true)
      setFormData({})
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            required={field.required}
            value={value}
            onChange={e => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            required={field.required}
            value={value}
            onChange={e => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            required={field.required}
            value={value}
            onChange={e => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          />
        )
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => handleChange(field.name, e.target.checked)}
            className="w-4 h-4"
          />
        )
      case 'select':
        return (
          <select
            required={field.required}
            value={value}
            onChange={e => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      default:
        return <p className="text-red-500">Unknown field type: {field.type}</p>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Submitted successfully!</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
