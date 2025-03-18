'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  note.init({
    noteTitle: DataTypes.STRING,
    noteState: DataTypes.BIGINT,
    noteType: DataTypes.STRING,
    noteTag: DataTypes.STRING,
    noteContent: DataTypes.TEXT,
    noteImgs: DataTypes.STRING,
    nLikeCount: DataTypes.BIGINT,
    nCollectCount: DataTypes.BIGINT,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'note',
  });
  return note;
};