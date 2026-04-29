import { Config, UIComponent } from '@/types/config'

const BASE_URL = 'http://localhost:8000'
let currentConfigId: string | null = null

export function setCurrentConfigId(id: string) {
  currentConfigId = id
}

export function getCurrentConfigId(): string | null {
  return currentConfigId
}

export async function fetchConfigs(token: string) {
  const res = await fetch(`${BASE_URL}/configs`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch configs')
  const configs = await res.json()
  console.log('Got configs:', configs.length)
  
  if (configs.length > 0) {
    const config = configs[0]
    currentConfigId = config.id
    console.log('Setting currentConfigId to:', currentConfigId)
    await mountConfig(config, token)
  }
  
  return configs
}

async function mountConfig(config: any, token: string) {
  // Get the raw config_json from the config object
  let configJson = config.config_json
  if (!configJson) {
    // If config_json doesn't exist, it's already a parsed config object
    configJson = JSON.stringify(config)
  }
  
  const configId = config.id
  console.log('Mounting config:', configId, 'has config_json:', !!config.config_json)
  console.log('Config JSON sample:', configJson?.substring(0, 100))
  
  try {
    const res = await fetch(`${BASE_URL}/api/mount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ config_json: configJson, config_id: configId })
    })
    const data = await res.json()
    console.log('Mount result:', data)
  } catch (e) {
    console.error('Mount error:', e)
  }
}

export async function createConfig(name: string, configJson: string, token: string) {
  const res = await fetch(`${BASE_URL}/configs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, config_json: configJson })
  })
  if (!res.ok) throw new Error('Failed to create config')
  const config = await res.json()
  currentConfigId = config.id
  console.log('Config created:', config.id)
  
  try {
    const mountRes = await fetch(`${BASE_URL}/api/mount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ config_json: configJson, config_id: config.id })
    })
    const mountData = await mountRes.json()
    console.log('Config mounted, routes:', mountData.routes)
    if (mountData.error) console.error('Mount error:', mountData.error)
  } catch (e) {
    console.error('Mount error:', e)
  }
  
  return config
}

export async function fetchApi(path: string, token: string, options?: RequestInit) {
  const configId = currentConfigId || 'default'
  // Always prepend configId to the path
  const cleanPath = path.replace(/^\/api/, '') // Remove /api if present
  const fullPath = `/api/${configId}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`
  console.log('Fetching:', fullPath, 'original:', path)
  const res = await fetch(`${BASE_URL}${fullPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers
    }
  })
  if (!res.ok) throw new Error(`API error: ${res.status}: ${path}`)
  return res.json()
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Registration failed')
  return res.json()
}
