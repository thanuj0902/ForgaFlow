export interface Config {
  id: string
  name: string
  app: {
    name: string
    description?: string
    auth: {
      enabled: boolean
      method: string
    }
  }
  ui: UIComponent[]
  apis: APIConfig[]
  database: {
    tables: TableConfig[]
  }
  locale?: {
    default: string
    supported: string[]
  }
}

export interface UIComponent {
  id: string
  type: 'form' | 'table' | 'dashboard'
  title: string
  fields?: FieldConfig[]
  api_binding?: string
}

export interface FieldConfig {
  name: string
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'boolean'
  label: string
  required?: boolean
  options?: string[]
}

export interface APIConfig {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  action: 'create' | 'read' | 'update' | 'delete' | 'list'
  table: string
}

export interface TableConfig {
  name: string
  fields: TableFieldConfig[]
}

export interface TableFieldConfig {
  name: string
  type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'json'
  required?: boolean
  unique?: boolean
}

export interface TranslationMap {
  [key: string]: {
    [lang: string]: string
  }
}
