'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    userName: DataTypes.STRING,
    userImg: DataTypes.STRING,
    userRole: DataTypes.STRING,
    userState: DataTypes.BIGINT,
    authState: DataTypes.BIGINT,
    sex: DataTypes.BIGINT,
    realName: DataTypes.STRING,
    birthday: DataTypes.DATE,
    idCardNo: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    age: DataTypes.BIGINT,
    email: DataTypes.STRING,
    province: DataTypes.STRING,
    provinceId: DataTypes.BIGINT,
    city: DataTypes.STRING,
    cityId: DataTypes.BIGINT,
    area: DataTypes.STRING,
    areaId: DataTypes.BIGINT,
    address: DataTypes.STRING,
    longitude: DataTypes.DECIMAL,
    latitude: DataTypes.DECIMAL,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
    remark: DataTypes.TEXT,
    registerFrom: DataTypes.BIGINT,
    userTags: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};