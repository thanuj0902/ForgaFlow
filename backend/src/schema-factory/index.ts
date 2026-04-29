import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface DynamicModelAttributes {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  user_id?: string;
  [key: string]: any;
}

// Registry for dynamic models (module-level cache)
let MODEL_CACHE: { [key: string]: any } = {};

const TYPE_MAP: { [key: string]: any } = {
  string: DataTypes.STRING,
  integer: DataTypes.INTEGER,
  float: DataTypes.FLOAT,
  boolean: DataTypes.BOOLEAN,
  date: DataTypes.DATE,
  json: DataTypes.JSON
};

export function createDynamicModel(tableConfig: any): any {
  const tableName = tableConfig.name;
  const fieldsConfig = tableConfig.fields || [];

  const attributes: any = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  };

  // Add dynamic fields
  fieldsConfig.forEach((field: any) => {
    const fieldName = field.name;
    const fieldType = field.type || 'string';
    const dataType = TYPE_MAP[fieldType] || DataTypes.STRING;

    attributes[fieldName] = {
      type: dataType,
      allowNull: !field.required,
      unique: field.unique || false,
    };
  });

  // Create the model
  const Model = sequelize.define(tableName, attributes, {
    tableName: tableName,
    timestamps: true,
    underscored: true,
  });

  // Store in both cache and sequelize registry
  MODEL_CACHE[tableName] = Model;

  // Sync model to database
  sequelize.sync({ alter: true }).catch((err: any) => {
    console.error('Error syncing model', tableName, err);
  });

  return Model;
}

export function createAllModels(databaseConfig: any): any {
  const tables = databaseConfig?.tables || [];
  const models: any = {};

  tables.forEach((tableConfig: any) => {
    const model = createDynamicModel(tableConfig);
    models[tableConfig.name] = model;
  });

  return models;
}

export function getModel(tableName: string): any {
  // First check cache, then sequelize registry
  if (MODEL_CACHE[tableName]) return MODEL_CACHE[tableName];
  
  // Try sequelize's own registry
  if (sequelize.models[tableName]) {
    MODEL_CACHE[tableName] = sequelize.models[tableName];
    return sequelize.models[tableName];
  }
  
  return undefined;
}

export function clearModelCache() {
  MODEL_CACHE = {};
}
