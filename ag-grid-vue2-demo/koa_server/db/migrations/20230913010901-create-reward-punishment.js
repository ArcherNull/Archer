/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 17:40:43
 * @LastEditTime: 2023-10-06 10:47:50
 * @Description:
 */
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reward_punishments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rpName: {
        type: Sequelize.STRING,
      },
      rpState: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.BIGINT,
      },
      rpType: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "惩罚类型，奖励，惩罚",
      },
      rpTag: {
        type: Sequelize.STRING,
        comment: "惩罚标签，生活，学习，健康",
      },
      rpRemark: {
        type: Sequelize.TEXT,
      },
      bindTaskId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("reward_punishments");
  },
};
