import { Config } from '@/types/config'

export function validateConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config || typeof config !== 'object') {
    errors.push('Config must be a JSON object')
    return { valid: false, errors }
  }
  
  const c = config as Record<string, unknown>
  
  if (!c.app || typeof c.app !== 'object') {
    errors.push('Missing or invalid "app" section')
  }
  
  if (!c.ui || !Array.isArray(c.ui)) {
    errors.push('Missing or invalid "ui" array')
  }
  
  if (!c.apis || !Array.isArray(c.apis)) {
    errors.push('Missing or invalid "apis" array')
  }
  
  if (!c.database || !c.database || typeof c.database !== 'object') {
    errors.push('Missing or invalid "database" section')
  }
  
  return { valid: errors.length === 0, errors }
}
