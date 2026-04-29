import { v4 as uuidv4 } from 'uuid';

interface ParseResult {
  normalised_config: any;
  warnings: string[];
  errors: string[];
}

export function parseConfig(rawConfig: any): ParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const normalised: any = {
    app: {
      name: 'Untitled App',
      description: '',
      auth: { enabled: false, method: 'email_password' }
    },
    ui: [],
    apis: [],
    database: { tables: [] },
    locale: { default: 'en', supported: ['en'] }
  };

  if (rawConfig === null || rawConfig === undefined) {
    warnings.push('Config is empty, using defaults');
    return { normalised_config: normalised, warnings, errors };
  }

  if (typeof rawConfig !== 'object') {
    errors.push('Config must be a JSON object');
    return { normalised_config: normalised, warnings, errors };
  }

  // Check top-level keys
  const expectedTopKeys = ['app', 'ui', 'apis', 'database', 'locale'];
  for (const key of Object.keys(rawConfig)) {
    if (!expectedTopKeys.includes(key)) {
      warnings.push(`Unknown top-level key: ${key}`);
    }
  }

  // Parse app config
  if (rawConfig.app !== undefined) {
    Object.assign(normalised.app, parseApp(rawConfig.app, warnings));
  }

  // Parse ui config
  if (rawConfig.ui !== undefined) {
    normalised.ui = parseUI(rawConfig.ui, warnings);
  }

  // Parse apis config
  if (rawConfig.apis !== undefined) {
    normalised.apis = parseAPIs(rawConfig.apis, warnings);
  }

  // Parse database config
  if (rawConfig.database !== undefined) {
    normalised.database = parseDatabase(rawConfig.database, warnings);
  }

  // Parse locale config
  if (rawConfig.locale !== undefined) {
    normalised.locale = parseLocale(rawConfig.locale, warnings);
  }

  return { normalised_config: normalised, warnings, errors };
}

function parseApp(appConfig: any, warnings: string[]): any {
  const normalised: any = { name: 'Untitled App', description: '', auth: { enabled: false, method: 'email_password' } };

  if (typeof appConfig !== 'object') {
    warnings.push('app config is not an object, using default');
    return normalised;
  }

  for (const key of Object.keys(appConfig)) {
    if (!['name', 'description', 'auth'].includes(key)) {
      warnings.push(`Unknown key in app: ${key}`);
    }
  }

  if (typeof appConfig.name === 'string') {
    normalised.name = appConfig.name;
  } else if (appConfig.name !== undefined) {
    warnings.push('app.name is not a string, using default');
  }

  if (typeof appConfig.description === 'string') {
    normalised.description = appConfig.description;
  }

  if (appConfig.auth !== undefined) {
    normalised.auth = parseAuth(appConfig.auth, warnings);
  }

  return normalised;
}

function parseAuth(authConfig: any, warnings: string[]): any {
  const normalised = { enabled: false, method: 'email_password' };

  if (typeof authConfig !== 'object') {
    warnings.push('app.auth is not an object, using default');
    return normalised;
  }

  for (const key of Object.keys(authConfig)) {
    if (!['enabled', 'method'].includes(key)) {
      warnings.push(`Unknown key in app.auth: ${key}`);
    }
  }

  if (typeof authConfig.enabled === 'boolean') {
    normalised.enabled = authConfig.enabled;
  }

  if (authConfig.method === 'email_password') {
    normalised.method = authConfig.method;
  } else if (authConfig.method !== undefined) {
    warnings.push(`Unknown auth method: ${authConfig.method}, using default`);
  }

  return normalised;
}

function parseUI(uiConfig: any, warnings: string[]): any[] {
  if (!Array.isArray(uiConfig)) {
    warnings.push('ui config is not an array, using default empty');
    return [];
  }

  return uiConfig.map((item: any, i: number) => {
    if (typeof item !== 'object') {
      warnings.push(`ui[${i}] is not an object, skipping`);
      return null;
    }

    for (const key of Object.keys(item)) {
      if (!['id', 'type', 'title', 'fields', 'api_binding'].includes(key)) {
        warnings.push(`Unknown key in ui[${i}]: ${key}`);
      }
    }

    const normalised: any = {
      id: typeof item.id === 'string' ? item.id : uuidv4(),
      type: ['form', 'table', 'dashboard'].includes(item.type) ? item.type : 'form',
      title: typeof item.title === 'string' ? item.title : '',
      fields: [],
      api_binding: typeof item.api_binding === 'string' ? item.api_binding : null
    };

    if (!['form', 'table', 'dashboard'].includes(item.type)) {
      warnings.push(`ui[${i}].type invalid, defaulting to form`);
    }

    normalised.fields = parseFields(item.fields, i, warnings);

    return normalised;
  }).filter(Boolean);
}

function parseFields(fields: any, uiIndex: number, warnings: string[]): any[] {
  if (!Array.isArray(fields)) {
    warnings.push(`ui[${uiIndex}].fields is not an array, using empty`);
    return [];
  }

  return fields.map((field: any, j: number) => {
    if (typeof field !== 'object') {
      warnings.push(`ui[${uiIndex}].fields[${j}] is not object, skipping`);
      return null;
    }

    for (const key of Object.keys(field)) {
      if (!['name', 'type', 'label', 'required', 'options'].includes(key)) {
        warnings.push(`Unknown key in ui[${uiIndex}].fields[${j}]: ${key}`);
      }
    }

    if (typeof field.name !== 'string') {
      warnings.push(`ui[${uiIndex}].fields[${j}].name missing or invalid, skipping`);
      return null;
    }

    const normalised: any = {
      name: field.name,
      type: ['text', 'number', 'email', 'select', 'date', 'boolean'].includes(field.type) ? field.type : 'text',
      label: typeof field.label === 'string' ? field.label : field.name,
      required: typeof field.required === 'boolean' ? field.required : false,
      options: Array.isArray(field.options) ? field.options : []
    };

    if (!['text', 'number', 'email', 'select', 'date', 'boolean'].includes(field.type)) {
      warnings.push(`ui[${uiIndex}].fields[${j}].type invalid, defaulting to text`);
    }

    return normalised;
  }).filter(Boolean);
}

function parseAPIs(apisConfig: any, warnings: string[]): any[] {
  if (!Array.isArray(apisConfig)) {
    warnings.push('apis config is not an array, using default empty');
    return [];
  }

  return apisConfig.map((api: any, i: number) => {
    if (typeof api !== 'object') {
      warnings.push(`apis[${i}] is not an object, skipping`);
      return null;
    }

    for (const key of Object.keys(api)) {
      if (!['id', 'path', 'method', 'action', 'table'].includes(key)) {
        warnings.push(`Unknown key in apis[${i}]: ${key}`);
      }
    }

    return {
      id: typeof api.id === 'string' ? api.id : uuidv4(),
      path: typeof api.path === 'string' ? api.path : '/unknown',
      method: ['GET', 'POST', 'PUT', 'DELETE'].includes(api.method) ? api.method : 'GET',
      action: ['create', 'read', 'update', 'delete', 'list'].includes(api.action) ? api.action : 'list',
      table: typeof api.table === 'string' ? api.table : 'unknown'
    };
  }).filter(Boolean);
}

function parseDatabase(dbConfig: any, warnings: string[]): any {
  const normalised = { tables: [] };

  if (typeof dbConfig !== 'object') {
    warnings.push('database config is not an object, using default');
    return normalised;
  }

  for (const key of Object.keys(dbConfig)) {
    if (key !== 'tables') {
      warnings.push(`Unknown key in database: ${key}`);
    }
  }

  if (!Array.isArray(dbConfig.tables)) {
    warnings.push('database.tables is not an array, using default');
    return normalised;
  }

  normalised.tables = dbConfig.tables.map((table: any, i: number) => {
    if (typeof table !== 'object') {
      warnings.push(`database.tables[${i}] is not an object, skipping`);
      return null;
    }

    if (typeof table.name !== 'string') {
      warnings.push(`database.tables[${i}].name missing or invalid, skipping`);
      return null;
    }

    return {
      name: table.name,
      fields: parseTableFields(table.fields, i, warnings)
    };
  }).filter(Boolean);

  return normalised;
}

function parseTableFields(fields: any, tableIndex: number, warnings: string[]): any[] {
  if (!Array.isArray(fields)) {
    return [];
  }

  const typeMap: any = { string: true, integer: true, float: true, boolean: true, date: true, json: true };

  return fields.map((field: any, j: number) => {
    if (typeof field !== 'object') return null;

    if (typeof field.name !== 'string') return null;

    const fieldType = typeMap[field.type] ? field.type : 'string';
    if (!typeMap[field.type]) {
      warnings.push(`Unknown field type, defaulting to string`);
    }

    return {
      name: field.name,
      type: fieldType,
      required: typeof field.required === 'boolean' ? field.required : false,
      unique: typeof field.unique === 'boolean' ? field.unique : false
    };
  }).filter(Boolean);
}

function parseLocale(localeConfig: any, warnings: string[]): any {
  const normalised = { default: 'en', supported: ['en'] };

  if (typeof localeConfig !== 'object') {
    warnings.push('locale config is not an object, using default');
    return normalised;
  }

  for (const key of Object.keys(localeConfig)) {
    if (!['default', 'supported'].includes(key)) {
      warnings.push(`Unknown key in locale: ${key}`);
    }
  }

  if (typeof localeConfig.default === 'string') {
    normalised.default = localeConfig.default;
  }

  if (Array.isArray(localeConfig.supported)) {
    normalised.supported = localeConfig.supported.filter((lang: any) => typeof lang === 'string');
  }

  return normalised;
}
