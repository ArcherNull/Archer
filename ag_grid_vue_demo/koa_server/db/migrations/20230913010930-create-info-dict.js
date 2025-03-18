/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 18:15:01
 * @LastEditTime: 2023-07-28 18:15:24
 * @Description: 
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('info_dicts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dicLabel: {
        allowNull: false,
        type: Sequelize.STRING,
        comment:'字典label'
      },
      dicValue: {
        allowNull: false,
        type: Sequelize.STRING,
        comment:'字典value'
      },
      dicBindId: {
        type: Sequelize.INTEGER,
        comment:'绑定父级id'
      },
      dicState: {
        type: Sequelize.BIGINT(1),
        comment:'字典状态 : 0-禁用；1-启用；',
        defaultValue: 1,
      },
      dicExtraParams: {
        type: Sequelize.JSON
      },
      dicRemark: {
        type: Sequelize.TEXT
      },
      createBy: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createById: {
        allowNull: false,
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
    await queryInterface.dropTable('info_dicts');
  }
};