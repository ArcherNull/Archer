/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 17:40:39
 * @LastEditTime: 2023-09-13 10:39:36
 * @Description: 
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskName: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      taskState: {
        allowNull: false,
        type: Sequelize.BIGINT(1),
        defaultValue: 1,
        comment: "任务状态：0-删除；1-新增；2-已完成；3-未完成；4-废弃",
      },
      taskType: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '普通',
        comment: "任务类型：紧急，重要，主要，普通",
      },
      taskTag: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '其它',
        comment: "任务标签：生活，学习，健康, 其它"
      },
      taskStartTime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      taskEndTime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      taskStartRealDoTime: {
        type: Sequelize.DATE,
      },
      taskEndRealDoTime: {
        type: Sequelize.DATE,
      },
      taskRemark: {
        type: Sequelize.TEXT,
      },
      bindPlanId: {
        type: Sequelize.INTEGER,
      },
      createBy: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createById: {
        allowNull: false,
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
    await queryInterface.dropTable('tasks');
  }
};