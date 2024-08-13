"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      noteTitle: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      noteState: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: 1,
        comment: "笔记状态，0-删除，1-新增",
      },
      noteType: {
        type: Sequelize.STRING,
        comment: "笔记类型，生活，健康，学习",
      },
      noteTag: {
        type: Sequelize.STRING,
        comment: "笔记标签，生活，健康，学习",
      },
      noteContent: {
        type: Sequelize.TEXT,
        allowNull: false,

      },
      noteImgs: {
        type: Sequelize.STRING,
      },
      nLikeCount: {
        type: Sequelize.BIGINT,
      },
      nCollectCount: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable("notes");
  },
};
