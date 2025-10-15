/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-10 10:16:33
 * @LastEditTime: 2024-04-10 10:20:00
 * @Description: 
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_table_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      configJson: {
        type: Sequelize.JSON,
        comment:'表格配置json字段，用于存放主题/样式/特殊设置'
      },
      fieldJson: {
        type: Sequelize.JSON,
        comment:'表格字段json配置字段，用于表格字段的显隐，固定列等'
      },
      menuName: {
        type: Sequelize.STRING,
        comment:'应表格的菜单名称'
      },
      type: {
        type: Sequelize.STRING,
        comment:'同一菜单下不同表格名称类型'
      },
      userId: {
        type: Sequelize.INTEGER,
        comment:'设置表格字段的用户id'
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
    await queryInterface.dropTable('user_table_configs');
  }
};