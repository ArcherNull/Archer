'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class info_code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  info_code.init({
    icClassify: DataTypes.STRING,
    icContent: DataTypes.TEXT,
    icState: DataTypes.BIGINT,
    icType: DataTypes.STRING,
    icReValJson: DataTypes.JSON,
    icExpiresTime: DataTypes.DATE,
    icRemark: DataTypes.TEXT,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'info_code',
  });
  return info_code;
};