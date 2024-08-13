/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 11:23:12
 * @LastEditTime: 2023-06-30 11:28:31
 * @Description: 
 */
'use strict';

const { wellKonwSayingMockSeed } = require("../mock/wellKonwSayingMockSeed");

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

     const insertData = wellKonwSayingMockSeed();

     console.log("insertData", insertData);
 
     await queryInterface.bulkInsert("well_konwn_sayings", [...insertData.data], {});
 
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("well_konwn_sayings", null, {});

  }
};
