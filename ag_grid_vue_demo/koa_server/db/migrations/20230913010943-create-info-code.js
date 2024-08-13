/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 17:41:14
 * @LastEditTime: 2023-09-15 16:22:04
 * @Description: 
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('info_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      icClassify: {
        type: Sequelize.STRING,
        comment:
          "信息码分类 preLogin-预登录校验，isLogin-正登录中，resetPwd-重置密码",
      },
      icContent: {
        type: Sequelize.TEXT,
      },
      icState: {
        type: Sequelize.BIGINT,
        comment: "信息码状态 0-禁用，1-启用，2-删除",
        defaultValue: 1,
      },
      icType: {
        type: Sequelize.STRING,
        comment: "信息码分类 email-邮箱，phoneNumberVerifyCode-手机验证码",
      },
      icReValJson: {
        type: Sequelize.JSON,
        comment: "额外再校验的json参数",
      },
      icExpiresTime: {
        type: Sequelize.DATE,
        comment: "信息码的失效时间",
      },
      icRemark: {
        type: Sequelize.TEXT,
      },
      createBy: {
        type: Sequelize.STRING,
      },
      createById: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('info_codes');
  }
};