'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class info_dict extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  info_dict.init({
    dicLabel: DataTypes.STRING,
    dicValue: DataTypes.STRING,
    dicBindId: DataTypes.INTEGER,
    dicState: DataTypes.BIGINT,
    dicExtraParams: DataTypes.JSON,
    dicRemark: DataTypes.TEXT,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'info_dict',
  });
  return info_dict;
};