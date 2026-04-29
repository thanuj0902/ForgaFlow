'use client'
import { useState } from 'react'

interface ConfigUploadProps {
  token: string
  configJson: string
  setConfigJson: (json: string) => void
  onMount: () => void
}

export default function ConfigUpload({ configJson, setConfigJson, onMount }: ConfigUploadProps) {
  const [error, setError] = useState('')

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigJson(e.target.value)
    setError('')
  }

  const handleValidate = () => {
    try {
      JSON.parse(configJson)
      setError('')
      alert('Valid JSON!')
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message)
    }
  }

  return (
    <div className="mb-8 p-6 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Config Upload</h2>
      <textarea
        value={configJson}
        onChange={handlePaste}
        placeholder='Paste your config JSON here... (e.g., {"app": {"name": "My App"}, "ui": [], "apis": [], "database": {"tables": []}})'
        className="w-full h-48 p-4 border rounded font-mono text-sm"
      />
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Validate
        </button>
        <button
          onClick={onMount}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Config
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
