/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 11:22:21
 * @LastEditTime: 2023-06-30 11:24:02
 * @Description: 
 */
'use strict';
const { planMockSeed } = require("../mock/planMockSeed");

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

     const insertData = planMockSeed();

     console.log("insertData", insertData);
 
     await queryInterface.bulkInsert("Plans", [...insertData.data], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("Plans", null, {});
  }
};
