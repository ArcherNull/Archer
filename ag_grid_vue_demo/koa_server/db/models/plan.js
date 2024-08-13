'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  plan.init({
    planName: DataTypes.STRING,
    planState: DataTypes.BIGINT,
    planType: DataTypes.STRING,
    planTag: DataTypes.STRING,
    planStartDoTime: DataTypes.DATE,
    planEndDoTime: DataTypes.DATE,
    planStartRealDoTime: DataTypes.DATE,
    planEndRealDoTime: DataTypes.DATE,
    planRemark: DataTypes.TEXT,
    planParentId: DataTypes.INTEGER,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'plan',
  });
  return plan;
};