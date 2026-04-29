import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface ConfigStoreAttributes {
  id: string;
  name: string;
  config_json: string;
  version: string;
  user_id: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ConfigStoreCreationAttributes extends Optional<ConfigStoreAttributes, 'id' | 'version'> {}

class ConfigStore extends Model<ConfigStoreAttributes, ConfigStoreCreationAttributes> implements ConfigStoreAttributes {
  public id!: string;
  public name!: string;
  public config_json!: string;
  public version!: string;
  public user_id!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ConfigStore.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    config_json: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ConfigStore',
    tableName: 'config_store',
  }
);

// Associations
ConfigStore.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ConfigStore, { foreignKey: 'user_id', as: 'configs' });

export default ConfigStore;
