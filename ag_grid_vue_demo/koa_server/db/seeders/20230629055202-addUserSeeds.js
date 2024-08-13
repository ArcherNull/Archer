/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-29 13:52:02
 * @LastEditTime: 2023-06-29 14:54:49
 * @Description:
 */
"use strict";
const { getUserMockSeeds } = require("../mock/userMockSeed");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    const insertData = getUserMockSeeds();

    console.log("insertData", insertData);

    await queryInterface.bulkInsert("Users", [...insertData.data], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {});
  },
};
