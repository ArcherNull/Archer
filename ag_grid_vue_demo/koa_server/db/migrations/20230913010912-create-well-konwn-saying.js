/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-09-13 09:09:12
 * @LastEditTime: 2023-10-06 13:57:28
 * @Description:
 */
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("well_konwn_sayings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      wksState: {
        type: Sequelize.BIGINT,
        defaultValue: 1,
        comment: "名言状态， 0-禁用，1-启用",
      },
      wksType: {
        type: Sequelize.STRING,
        comment: "名言类型， 文言文，古诗，散文，哲学，其它",
      },
      wksTag: {
        type: Sequelize.STRING,
        comment:'名言标签：爱情，励志，智慧，童话，其它'
      },
      wksCNContent: {
        type: Sequelize.TEXT,
      },
      wksENContent: {
        type: Sequelize.TEXT,
      },
      wksAuthor: {
        type: Sequelize.STRING,
      },
      wksRemark: {
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
    await queryInterface.dropTable("well_konwn_sayings");
  },
};
