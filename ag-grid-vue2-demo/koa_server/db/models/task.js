'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  task.init({
    taskName: DataTypes.STRING,
    taskState: DataTypes.BIGINT,
    taskType: DataTypes.STRING,
    taskTag: DataTypes.STRING,
    taskStartTime: DataTypes.DATE,
    taskEndTime: DataTypes.DATE,
    taskStartRealDoTime: DataTypes.DATE,
    taskEndRealDoTime: DataTypes.DATE,
    taskRemark: DataTypes.TEXT,
    bindPlanId: DataTypes.INTEGER,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'task',
  });
  return task;
};