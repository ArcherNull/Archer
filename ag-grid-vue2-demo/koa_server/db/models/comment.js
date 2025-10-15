'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  comment.init({
    cName: DataTypes.STRING,
    cState: DataTypes.BIGINT,
    cType: DataTypes.STRING,
    cContent: DataTypes.TEXT,
    cImgs: DataTypes.STRING,
    cLikeCount: DataTypes.BIGINT,
    cIsLike: DataTypes.BIGINT,
    bindPlanId: DataTypes.INTEGER,
    bindTaskId: DataTypes.INTEGER,
    bindNoteId: DataTypes.INTEGER,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};