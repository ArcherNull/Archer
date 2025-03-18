'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class electronic_fence extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  electronic_fence.init({
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    category: DataTypes.STRING,
    radius: DataTypes.DECIMAL,
    size: DataTypes.DECIMAL,
    address: DataTypes.STRING,
    remark: DataTypes.STRING,
    state: DataTypes.INTEGER,
    dispatchAreaCoordinates: DataTypes.JSON,
    longitude: DataTypes.DECIMAL,
    latitude: DataTypes.DECIMAL,
    updateBy: DataTypes.STRING,
    updateById: DataTypes.INTEGER,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'electronic_fence',
  });
  return electronic_fence;
};