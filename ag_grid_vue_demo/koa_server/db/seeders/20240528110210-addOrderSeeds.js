/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-28 19:02:10
 * @LastEditTime: 2024-05-28 21:44:56
 * @Description: 
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */

const { getOrderMockSeeds } = require("../mock/orderMockSeed");

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
    const insertData = getOrderMockSeeds();
    // console.log("insertData", insertData);
    await queryInterface.bulkInsert("orders", [...insertData.data], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("orders", null, {});
  }
};
