'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reward_punishment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  reward_punishment.init({
    rpName: DataTypes.STRING,
    rpState: DataTypes.BIGINT,
    rpType: DataTypes.STRING,
    rpTag: DataTypes.STRING,
    rpRemark: DataTypes.TEXT,
    bindTaskId: DataTypes.INTEGER,
    bindPlanId: DataTypes.INTEGER,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'reward_punishment',
  });
  return reward_punishment;
};