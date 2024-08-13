'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class well_konwn_saying extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  well_konwn_saying.init({
    wksState: DataTypes.BIGINT,
    wksType: DataTypes.STRING,
    wksTag: DataTypes.STRING,
    wksCNContent: DataTypes.TEXT,
    wksENContent: DataTypes.TEXT,
    wksAuthor: DataTypes.STRING,
    wksRemark: DataTypes.TEXT,
    createBy: DataTypes.STRING,
    createById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'well_konwn_saying',
  });
  return well_konwn_saying;
};