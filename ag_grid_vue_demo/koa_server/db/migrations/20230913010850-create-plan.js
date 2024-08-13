"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      planName: {
        allowNull: false,
        type: Sequelize.STRING(20),
        comment: "计划名称",
      },
      planState: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.BIGINT(1),
        comment: "计划状态, 0-删除；1-新增；2-已完成；3-未完成；4-废弃",
      },
      planType: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "计划类型, 日计划，周计划，月计划，季度计划，年计划",
      },
      planTag: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "计划标签：生活，学习，健康",
      },
      planStartDoTime: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "计划开始执行时间",
      },
      planEndDoTime: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "计划结束执行时间",
      },
      planStartRealDoTime: {
        type: Sequelize.DATE,
        comment: "计划实际开始时间",
      },
      planEndRealDoTime: {
        type: Sequelize.DATE,
        comment: "计划实际结束时间",
      },
      planRemark: {
        type: Sequelize.TEXT,
      },
      planParentId: {
        type: Sequelize.INTEGER,
        comment: "绑定的父计划id",
      },
      createBy: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "创建此计划的用户名",
      },
      createById: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: "创建此计划的用户id",
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
    await queryInterface.dropTable("plans");
  },
};
