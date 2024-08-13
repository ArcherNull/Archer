'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_table_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_table_config.init({
    configJson: DataTypes.JSON,
    fieldJson: DataTypes.JSON,
    menuName: DataTypes.STRING,
    type: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_table_config',
  });
  return user_table_config;
};