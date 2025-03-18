/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 11:22:31
 * @LastEditTime: 2023-06-30 11:25:11
 * @Description: 
 */
'use strict';

const { taskMockSeed } = require("../mock/taskMockSeed");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     const insertData = taskMockSeed();

     console.log("insertData", insertData);
 
     await queryInterface.bulkInsert("Tasks", [...insertData.data], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("Tasks", null, {});
  }
};
