/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-28 17:40:53
 * @LastEditTime: 2023-09-13 09:11:16
 * @Description: 
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cName: {
        type: Sequelize.STRING(20),
        comment:'评论名称, 如果内容过多，评论名称取自评论内容的第一句'
      },
      cState: {
        allowNull: false,
        type: Sequelize.BIGINT(1),
        comment:'评论状态：0-删除，1-公开，2-私有'
      },
      cType: {
        type: Sequelize.STRING,
        comment:'评论类型: 赞同，反对'
      },
      cContent: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment:'评论状态：0-删除，1-公开，2-私有'
      },
      cImgs: {
        type: Sequelize.STRING
      },
      cLikeCount: {
        type: Sequelize.BIGINT
      },
      cIsLike: {
        type: Sequelize.BIGINT(1)
      },
      bindPlanId: {
        type: Sequelize.INTEGER
      },
      bindTaskId: {
        type: Sequelize.INTEGER
      },
      bindNoteId: {
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
    await queryInterface.dropTable('comments');
  }
};