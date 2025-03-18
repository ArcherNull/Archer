'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('electronic_fences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      code: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(20)
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(40)
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(10),
        defaultValue: "点",
        comment: "围栏类型， 点 / 圆 / 区域",
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING(10),
        defaultValue: '发货区域',
        comment: "围栏分类，收货区域 / 发货区域",
      },
      radius: {
        type: Sequelize.DECIMAL
      },
      size: {
        type: Sequelize.DECIMAL
      },
      address: {
        type: Sequelize.STRING
      },
      remark: {
        type: Sequelize.STRING
      },
      state: {
        allowNull: false,
        type: Sequelize.BIGINT(1),
        defaultValue: 1,
        comment: "用户状态，0-禁用；1-启用；2-注销",
      },
      dispatchAreaCoordinates: {
        type: Sequelize.JSON,
        comment: "不规则形状坐标点json集合",
      },
      longitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 7),
        comment: "经度",
      },
      latitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 7),
        comment: "纬度",
      },
      updateBy: {
        type: Sequelize.STRING
      },
      updateById: {
        type: Sequelize.INTEGER
      },
      createBy: {
        type: Sequelize.STRING
      },
      createById: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('electronic_fences');
  }
};