/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-22 15:43:35
 * @LastEditTime: 2024-07-08 14:08:25
 * @Description: 
 */
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // 用户昵称
      userName: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "用户昵称",
      },
      userImg: {
        type: Sequelize.STRING,
      },
      userRole: {
        type: Sequelize.STRING,
        defaultValue: "普通用户",
        comment: "用户角色，超级管理员 ， 管理员 ， 普通用户",
      },
      userState: {
        allowNull: false,
        type: Sequelize.BIGINT(1),
        defaultValue: 1,
        comment: "用户状态，0-禁用；1-启用；2-注销",
      },
      authState: {
        type: Sequelize.BIGINT(1),
        defaultValue: 0,
        comment: "用户认证状态，0-未实名；1-认证中；2-已实名；3-认证失败",
      },
      sex: {
        type: Sequelize.BIGINT(1),
        defaultValue: 0,
        comment: "用户性别，0-女，1-男",
      },
      realName: {
        type: Sequelize.STRING(10),
      },
      birthday: {
        type: Sequelize.DATE,
      },
      idCardNo: {
        type: Sequelize.STRING(18),
      },
      phoneNumber: {
        type: Sequelize.STRING(11),
      },
      age: {
        type: Sequelize.BIGINT(3),
      },
      email: {
        type: Sequelize.STRING,
      },
      province: {
        type: Sequelize.STRING,
      },
      provinceId: {
        type: Sequelize.BIGINT(6),
      },
      city: {
        type: Sequelize.STRING,
      },
      cityId: {
        type: Sequelize.BIGINT(6),
      },
      area: {
        type: Sequelize.STRING,
      },
      areaId: {
        type: Sequelize.BIGINT(6),
      },
      address: {
        type: Sequelize.STRING,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
      },
      password: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
      remark: {
        type: Sequelize.TEXT,
      },
      registerFrom: {
        allowNull: false,
        type: Sequelize.BIGINT(1),
        defaultValue: 0,
        comment: "注册来自：0-官网，1-小程序，2-pc管理端",
      },
      userTags: {
        type: Sequelize.STRING,
        comment: "用户标签",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
